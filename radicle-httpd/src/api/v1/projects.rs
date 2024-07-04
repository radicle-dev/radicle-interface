use std::collections::{BTreeMap, BTreeSet, HashMap};

use axum::extract::{DefaultBodyLimit, State};
use axum::http::header;
use axum::response::IntoResponse;
use axum::routing::get;
use axum::{Json, Router};
use hyper::StatusCode;
use radicle_surf::blob::BlobRef;
use radicle_surf::{diff, Glob, Oid, Repository};
use serde::{Deserialize, Serialize};
use serde_json::json;

use radicle::cob::{issue::cache::Issues as _, patch::cache::Patches as _, Author};
use radicle::identity::RepoId;
use radicle::node::routing::Store;
use radicle::node::{AliasStore, NodeId};
use radicle::storage::{ReadRepository, ReadStorage, RemoteRepository};

use crate::api::error::Error;
use crate::api::project::Info;
use crate::api::search::{SearchQueryString, SearchResult};
use crate::api::{self, CobsQuery, Context, PaginationQuery, ProjectQuery};
use crate::axum_extra::{cached_response, immutable_response, Path, Query};

const MAX_BODY_LIMIT: usize = 4_194_304;

pub fn router(ctx: Context) -> Router {
    Router::new()
        .route("/projects", get(project_root_handler))
        .route("/projects/search", get(project_search_handler))
        .route("/projects/:project", get(project_handler))
        .route("/projects/:project/commits", get(history_handler))
        .route("/projects/:project/commits/:sha", get(commit_handler))
        .route("/projects/:project/diff/:base/:oid", get(diff_handler))
        .route("/projects/:project/activity", get(activity_handler))
        .route("/projects/:project/tree/:sha/", get(tree_handler_root))
        .route("/projects/:project/tree/:sha/*path", get(tree_handler))
        .route(
            "/projects/:project/stats/tree/:sha",
            get(stats_tree_handler),
        )
        .route("/projects/:project/remotes", get(remotes_handler))
        .route("/projects/:project/remotes/:peer", get(remote_handler))
        .route("/projects/:project/blob/:sha/*path", get(blob_handler))
        .route("/projects/:project/readme/:sha", get(readme_handler))
        .route("/projects/:project/issues", get(issues_handler))
        .route("/projects/:project/issues/:id", get(issue_handler))
        .route("/projects/:project/patches", get(patches_handler))
        .route("/projects/:project/patches/:id", get(patch_handler))
        .with_state(ctx)
        .layer(DefaultBodyLimit::max(MAX_BODY_LIMIT))
}

/// List all projects.
/// `GET /projects`
async fn project_root_handler(
    State(ctx): State<Context>,
    Query(qs): Query<PaginationQuery>,
) -> impl IntoResponse {
    let PaginationQuery {
        show,
        page,
        per_page,
    } = qs;
    let page = page.unwrap_or(0);
    let per_page = per_page.unwrap_or(10);
    let storage = &ctx.profile.storage;
    let db = &ctx.profile.database()?;
    let pinned = &ctx.profile.config.web.pinned;
    let policies = ctx.profile.policies()?;

    let mut projects = match show {
        ProjectQuery::All => storage
            .repositories()?
            .into_iter()
            .filter(|repo| repo.doc.visibility.is_public())
            .collect::<Vec<_>>(),
        ProjectQuery::Pinned => storage
            .repositories_by_id(pinned.repositories.iter())?
            .into_iter()
            .filter(|repo| repo.doc.visibility.is_public())
            .collect::<Vec<_>>(),
    };
    projects.sort_by_key(|p| p.rid);

    let infos = projects
        .into_iter()
        .filter_map(|info| {
            if !policies.is_seeding(&info.rid).unwrap_or_default() {
                return None;
            }
            let Ok(repo) = storage.repository(info.rid) else {
                return None;
            };
            let Ok((_, head)) = repo.head() else {
                return None;
            };
            let Ok(payload) = info.doc.project() else {
                return None;
            };
            let Ok(issues) = ctx.profile.issues(&repo) else {
                return None;
            };
            let Ok(issues) = issues.counts() else {
                return None;
            };
            let Ok(patches) = ctx.profile.patches(&repo) else {
                return None;
            };
            let Ok(patches) = patches.counts() else {
                return None;
            };
            let aliases = ctx.profile.aliases();
            let delegates = info
                .doc
                .delegates
                .into_iter()
                .map(|did| api::json::author(&Author::new(did), aliases.alias(did.as_key())))
                .collect::<Vec<_>>();
            let seeding = db.count(&info.rid).unwrap_or_default();

            Some(Info {
                payload,
                delegates,
                head,
                threshold: info.doc.threshold,
                visibility: info.doc.visibility,
                issues,
                patches,
                id: info.rid,
                seeding,
            })
        })
        .skip(page * per_page)
        .take(per_page)
        .collect::<Vec<_>>();

    Ok::<_, Error>(Json(infos))
}

/// Search repositories by name.
/// `GET /projects/search?q=<query>`
///
/// We obtain the byte index of the first character of the query that matches the repo name.
/// And skip if the query doesn't match the repo name.
///
/// Sorting algorithm:
/// If both byte indices are 0, compare by seeding count.
/// A repo name with a byte index of 0 should come before non-zero indices.
/// If both indices are non-zero and equal, then compare by seeding count.
/// If none of the above, all non-zero indices are compared by their seeding count primarily.
async fn project_search_handler(
    State(ctx): State<Context>,
    Query(SearchQueryString { q, per_page, page }): Query<SearchQueryString>,
) -> impl IntoResponse {
    let q = q.unwrap_or_default();
    let page = page.unwrap_or(0);
    let per_page = per_page.unwrap_or(10);
    let storage = &ctx.profile.storage;
    let aliases = &ctx.profile.aliases();
    let db = &ctx.profile.database()?;
    let found_repos = storage
        .repositories()?
        .into_iter()
        .filter_map(|info| SearchResult::new(&q, info, db, aliases))
        .collect::<BTreeSet<SearchResult>>();

    let found_repos = found_repos
        .into_iter()
        .skip(page * per_page)
        .take(per_page)
        .collect::<Vec<_>>();

    Ok::<_, Error>(cached_response(found_repos, 600).into_response())
}

/// Get project metadata.
/// `GET /projects/:project`
async fn project_handler(State(ctx): State<Context>, Path(rid): Path<RepoId>) -> impl IntoResponse {
    let (repo, doc) = ctx.repo(rid)?;
    let info = ctx.project_info(&repo, doc)?;

    Ok::<_, Error>(Json(info))
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CommitsQueryString {
    pub parent: Option<String>,
    pub since: Option<i64>,
    pub until: Option<i64>,
    pub page: Option<usize>,
    pub per_page: Option<usize>,
}

/// Get project commit range.
/// `GET /projects/:project/commits?parent=<sha>`
async fn history_handler(
    State(ctx): State<Context>,
    Path(rid): Path<RepoId>,
    Query(qs): Query<CommitsQueryString>,
) -> impl IntoResponse {
    let (repo, doc) = ctx.repo(rid)?;
    let CommitsQueryString {
        since,
        until,
        parent,
        page,
        per_page,
    } = qs;

    // If the parent commit is provided, the response depends only on the query
    // string and not on the state of the repository. This means we can instruct
    // the caches to treat the response as immutable.
    let is_immutable = parent.is_some();

    let sha = match parent {
        Some(commit) => commit,
        None => ctx.project_info(&repo, doc)?.head.to_string(),
    };
    let repo = Repository::open(repo.path())?;

    // If a pagination is defined, we do not want to paginate the commits, and we return all of them on the first page.
    let page = page.unwrap_or(0);
    let per_page = if per_page.is_none() && (since.is_some() || until.is_some()) {
        usize::MAX
    } else {
        per_page.unwrap_or(30)
    };

    let commits = repo
        .history(&sha)?
        .filter_map(|commit| {
            let commit = commit.ok()?;
            let time = commit.committer.time.seconds();
            let commit = api::json::commit(&commit);
            match (since, until) {
                (Some(since), Some(until)) if time >= since && time < until => Some(commit),
                (Some(since), None) if time >= since => Some(commit),
                (None, Some(until)) if time < until => Some(commit),
                (None, None) => Some(commit),
                _ => None,
            }
        })
        .skip(page * per_page)
        .take(per_page)
        .collect::<Vec<_>>();

    if is_immutable {
        Ok::<_, Error>(immutable_response(commits).into_response())
    } else {
        Ok::<_, Error>(Json(commits).into_response())
    }
}

/// Get project commit.
/// `GET /projects/:project/commits/:sha`
async fn commit_handler(
    State(ctx): State<Context>,
    Path((project, sha)): Path<(RepoId, Oid)>,
) -> impl IntoResponse {
    let (repo, _) = ctx.repo(project)?;
    let repo = Repository::open(repo.path())?;
    let commit = repo.commit(sha)?;

    let diff = repo.diff_commit(commit.id)?;
    let glob = Glob::all_heads().branches().and(Glob::all_remotes());
    let branches: Vec<String> = repo
        .revision_branches(commit.id, glob)?
        .iter()
        .map(|b| b.refname().to_string())
        .collect();

    let mut files: HashMap<Oid, BlobRef<'_>> = HashMap::new();
    diff.files().for_each(|file_diff| match file_diff {
        diff::FileDiff::Added(added) => {
            if let Ok(blob) = repo.blob_ref(added.new.oid) {
                files.insert(blob.id(), blob);
            }
        }
        diff::FileDiff::Deleted(deleted) => {
            if let Ok(old_blob) = repo.blob_ref(deleted.old.oid) {
                files.insert(old_blob.id(), old_blob);
            }
        }
        diff::FileDiff::Modified(modified) => {
            if let (Ok(old_blob), Ok(new_blob)) = (
                repo.blob_ref(modified.old.oid),
                repo.blob_ref(modified.new.oid),
            ) {
                files.insert(old_blob.id(), old_blob);
                files.insert(new_blob.id(), new_blob);
            }
        }
        diff::FileDiff::Moved(moved) => {
            if let (Ok(old_blob), Ok(new_blob)) =
                (repo.blob_ref(moved.old.oid), repo.blob_ref(moved.new.oid))
            {
                files.insert(old_blob.id(), old_blob);
                files.insert(new_blob.id(), new_blob);
            }
        }
        diff::FileDiff::Copied(copied) => {
            if let (Ok(old_blob), Ok(new_blob)) =
                (repo.blob_ref(copied.old.oid), repo.blob_ref(copied.new.oid))
            {
                files.insert(old_blob.id(), old_blob);
                files.insert(new_blob.id(), new_blob);
            }
        }
    });

    let response: serde_json::Value = json!({
      "commit": api::json::commit(&commit),
      "diff": diff,
      "files": files,
      "branches": branches
    });
    Ok::<_, Error>(immutable_response(response))
}

/// Get diff between two commits
/// `GET /projects/:project/diff/:base/:oid`
async fn diff_handler(
    State(ctx): State<Context>,
    Path((project, base, oid)): Path<(RepoId, Oid, Oid)>,
) -> impl IntoResponse {
    let (repo, _) = ctx.repo(project)?;
    let repo = Repository::open(repo.path())?;
    let base = repo.commit(base)?;
    let commit = repo.commit(oid)?;
    let diff = repo.diff(base.id, commit.id)?;
    let mut files: HashMap<Oid, BlobRef<'_>> = HashMap::new();
    diff.files().for_each(|file_diff| match file_diff {
        diff::FileDiff::Added(added) => {
            if let Ok(new_blob) = repo.blob_ref(added.new.oid) {
                files.insert(new_blob.id(), new_blob);
            }
        }
        diff::FileDiff::Deleted(deleted) => {
            if let Ok(old_blob) = repo.blob_ref(deleted.old.oid) {
                files.insert(old_blob.id(), old_blob);
            }
        }
        diff::FileDiff::Modified(modified) => {
            if let (Ok(new_blob), Ok(old_blob)) = (
                repo.blob_ref(modified.old.oid),
                repo.blob_ref(modified.new.oid),
            ) {
                files.insert(new_blob.id(), new_blob);
                files.insert(old_blob.id(), old_blob);
            }
        }
        diff::FileDiff::Moved(moved) => {
            if let (Ok(new_blob), Ok(old_blob)) =
                (repo.blob_ref(moved.new.oid), repo.blob_ref(moved.old.oid))
            {
                files.insert(new_blob.id(), new_blob);
                files.insert(old_blob.id(), old_blob);
            }
        }
        diff::FileDiff::Copied(copied) => {
            if let (Ok(new_blob), Ok(old_blob)) =
                (repo.blob_ref(copied.new.oid), repo.blob_ref(copied.old.oid))
            {
                files.insert(new_blob.id(), new_blob);
                files.insert(old_blob.id(), old_blob);
            }
        }
    });

    let commits = repo
        .history(commit.id)?
        .take_while(|c| {
            if let Ok(c) = c {
                c.id != base.id
            } else {
                false
            }
        })
        .map(|r| r.map(|c| api::json::commit(&c)))
        .collect::<Result<Vec<_>, _>>()?;

    let response = json!({ "diff": diff, "files": files, "commits": commits });

    Ok::<_, Error>(immutable_response(response))
}

/// Get project activity for the past year.
/// `GET /projects/:project/activity`
async fn activity_handler(
    State(ctx): State<Context>,
    Path(project): Path<RepoId>,
) -> impl IntoResponse {
    let (repo, _) = ctx.repo(project)?;
    let current_date = chrono::Utc::now().timestamp();
    // SAFETY: The number of weeks is static and not out of bounds.
    #[allow(clippy::unwrap_used)]
    let one_year_ago = chrono::Duration::try_weeks(52).unwrap();
    let repo = Repository::open(repo.path())?;
    let head = repo.head()?;
    let timestamps = repo
        .history(head)?
        .filter_map(|a| {
            if let Ok(a) = a {
                let seconds = a.committer.time.seconds();
                if seconds > current_date - one_year_ago.num_seconds() {
                    return Some(seconds);
                }
            }
            None
        })
        .collect::<Vec<i64>>();

    Ok::<_, Error>(cached_response(json!({ "activity": timestamps }), 3600))
}

/// Get project source tree for '/' path.
/// `GET /projects/:project/tree/:sha/`
async fn tree_handler_root(
    State(ctx): State<Context>,
    Path((rid, sha)): Path<(RepoId, Oid)>,
) -> impl IntoResponse {
    tree_handler(State(ctx), Path((rid, sha, String::new()))).await
}

/// Get project source tree.
/// `GET /projects/:project/tree/:sha/*path`
async fn tree_handler(
    State(ctx): State<Context>,
    Path((project, sha, path)): Path<(RepoId, Oid, String)>,
) -> impl IntoResponse {
    let (repo, _) = ctx.repo(project)?;

    if let Some(ref cache) = ctx.cache {
        let cache = &mut cache.tree.lock().await;
        if let Some(response) = cache.get(&(project, sha, path.clone())) {
            return Ok::<_, Error>(immutable_response(response.clone()));
        }
    }

    let repo = Repository::open(repo.path())?;
    let tree = repo.tree(sha, &path)?;
    let response = api::json::tree(&tree, &path);

    if let Some(cache) = &ctx.cache {
        let cache = &mut cache.tree.lock().await;
        cache.put((project, sha, path.clone()), response.clone());
    }

    Ok::<_, Error>(immutable_response(response))
}

/// Get project source tree stats.
/// `GET /projects/:project/stats/tree/:sha`
async fn stats_tree_handler(
    State(ctx): State<Context>,
    Path((project, sha)): Path<(RepoId, Oid)>,
) -> impl IntoResponse {
    let (repo, _) = ctx.repo(project)?;
    let repo = Repository::open(repo.path())?;
    let stats = repo.stats_from(&sha)?;

    Ok::<_, Error>(immutable_response(stats))
}

/// Get all project remotes.
/// `GET /projects/:project/remotes`
async fn remotes_handler(
    State(ctx): State<Context>,
    Path(project): Path<RepoId>,
) -> impl IntoResponse {
    let (repo, doc) = ctx.repo(project)?;
    let delegates = &doc.delegates;
    let aliases = &ctx.profile.aliases();
    let remotes = repo
        .remotes()?
        .filter_map(|r| r.map(|r| r.1).ok())
        .map(|remote| {
            let refs = remote
                .refs
                .iter()
                .filter_map(|(r, oid)| {
                    r.as_str()
                        .strip_prefix("refs/heads/")
                        .map(|head| (head.to_string(), oid))
                })
                .collect::<BTreeMap<String, &Oid>>();

            match aliases.alias(&remote.id) {
                Some(alias) => json!({
                    "id": remote.id,
                    "alias": alias,
                    "heads": refs,
                    "delegate": delegates.contains(&remote.id.into()),
                }),
                None => json!({
                    "id": remote.id,
                    "heads": refs,
                    "delegate": delegates.contains(&remote.id.into()),
                }),
            }
        })
        .collect::<Vec<_>>();

    Ok::<_, Error>(Json(remotes))
}

/// Get project remote.
/// `GET /projects/:project/remotes/:peer`
async fn remote_handler(
    State(ctx): State<Context>,
    Path((project, node_id)): Path<(RepoId, NodeId)>,
) -> impl IntoResponse {
    let (repo, doc) = ctx.repo(project)?;
    let delegates = &doc.delegates;
    let remote = repo.remote(&node_id)?;
    let refs = remote
        .refs
        .iter()
        .filter_map(|(r, oid)| {
            r.as_str()
                .strip_prefix("refs/heads/")
                .map(|head| (head.to_string(), oid))
        })
        .collect::<BTreeMap<String, &Oid>>();
    let remote = json!({
        "id": remote.id,
        "heads": refs,
        "delegate": delegates.contains(&remote.id.into()),
    });

    Ok::<_, Error>(Json(remote))
}

/// Get project source file.
/// `GET /projects/:project/blob/:sha/*path`
async fn blob_handler(
    State(ctx): State<Context>,
    Path((project, sha, path)): Path<(RepoId, Oid, String)>,
) -> impl IntoResponse {
    let (repo, _) = ctx.repo(project)?;
    let repo = Repository::open(repo.path())?;
    let blob = repo.blob(sha, &path)?;

    if blob.size() > MAX_BODY_LIMIT {
        return Ok::<_, Error>(
            (
                StatusCode::PAYLOAD_TOO_LARGE,
                [(header::CACHE_CONTROL, "no-cache")],
                Json(json!([])),
            )
                .into_response(),
        );
    }
    Ok::<_, Error>(immutable_response(api::json::blob(&blob, &path)).into_response())
}

/// Get project readme.
/// `GET /projects/:project/readme/:sha`
async fn readme_handler(
    State(ctx): State<Context>,
    Path((project, sha)): Path<(RepoId, Oid)>,
) -> impl IntoResponse {
    let (repo, _) = ctx.repo(project)?;
    let repo = Repository::open(repo.path())?;
    let paths = [
        "README",
        "README.md",
        "README.markdown",
        "README.txt",
        "README.rst",
        "README.org",
        "Readme.md",
    ];

    for path in paths
        .iter()
        .map(ToString::to_string)
        .chain(paths.iter().map(|p| p.to_lowercase()))
    {
        if let Ok(blob) = repo.blob(sha, &path) {
            if blob.size() > MAX_BODY_LIMIT {
                return Ok::<_, Error>(
                    (
                        StatusCode::PAYLOAD_TOO_LARGE,
                        [(header::CACHE_CONTROL, "no-cache")],
                        Json(json!([])),
                    )
                        .into_response(),
                );
            }

            return Ok::<_, Error>(
                immutable_response(api::json::blob(&blob, &path)).into_response(),
            );
        }
    }

    Err(Error::NotFound)
}

/// Get project issues list.
/// `GET /projects/:project/issues`
async fn issues_handler(
    State(ctx): State<Context>,
    Path(project): Path<RepoId>,
    Query(qs): Query<CobsQuery<api::IssueState>>,
) -> impl IntoResponse {
    let (repo, _) = ctx.repo(project)?;
    let CobsQuery {
        page,
        per_page,
        status,
    } = qs;
    let page = page.unwrap_or(0);
    let per_page = per_page.unwrap_or(10);
    let status = status.unwrap_or_default();
    let issues = ctx.profile.issues(&repo)?;
    let mut issues: Vec<_> = issues
        .list()?
        .filter_map(|r| {
            let (id, issue) = r.ok()?;
            (status.matches(issue.state())).then_some((id, issue))
        })
        .collect::<Vec<_>>();

    issues.sort_by(|(_, a), (_, b)| b.timestamp().cmp(&a.timestamp()));
    let aliases = &ctx.profile.aliases();
    let issues = issues
        .into_iter()
        .map(|(id, issue)| api::json::issue(id, issue, aliases))
        .skip(page * per_page)
        .take(per_page)
        .collect::<Vec<_>>();

    Ok::<_, Error>(Json(issues))
}

/// Get project issue.
/// `GET /projects/:project/issues/:id`
async fn issue_handler(
    State(ctx): State<Context>,
    Path((project, issue_id)): Path<(RepoId, Oid)>,
) -> impl IntoResponse {
    let (repo, _) = ctx.repo(project)?;
    let issue = ctx
        .profile
        .issues(&repo)?
        .get(&issue_id.into())?
        .ok_or(Error::NotFound)?;
    let aliases = ctx.profile.aliases();

    Ok::<_, Error>(Json(api::json::issue(issue_id.into(), issue, &aliases)))
}

/// Get project patches list.
/// `GET /projects/:project/patches`
async fn patches_handler(
    State(ctx): State<Context>,
    Path(rid): Path<RepoId>,
    Query(qs): Query<CobsQuery<api::PatchState>>,
) -> impl IntoResponse {
    let (repo, _) = ctx.repo(rid)?;
    let CobsQuery {
        page,
        per_page,
        status,
    } = qs;
    let page = page.unwrap_or(0);
    let per_page = per_page.unwrap_or(10);
    let status = status.unwrap_or_default();
    let patches = ctx.profile.patches(&repo)?;
    let mut patches = patches
        .list()?
        .filter_map(|r| {
            let (id, patch) = r.ok()?;
            (status.matches(patch.state())).then_some((id, patch))
        })
        .collect::<Vec<_>>();
    patches.sort_by(|(_, a), (_, b)| b.timestamp().cmp(&a.timestamp()));
    let aliases = ctx.profile.aliases();
    let patches = patches
        .into_iter()
        .map(|(id, patch)| api::json::patch(id, patch, &repo, &aliases))
        .skip(page * per_page)
        .take(per_page)
        .collect::<Vec<_>>();

    Ok::<_, Error>(Json(patches))
}

/// Get project patch.
/// `GET /projects/:project/patches/:id`
async fn patch_handler(
    State(ctx): State<Context>,
    Path((rid, patch_id)): Path<(RepoId, Oid)>,
) -> impl IntoResponse {
    let (repo, _) = ctx.repo(rid)?;
    let patches = ctx.profile.patches(&repo)?;
    let patch = patches.get(&patch_id.into())?.ok_or(Error::NotFound)?;
    let aliases = ctx.profile.aliases();

    Ok::<_, Error>(Json(api::json::patch(
        patch_id.into(),
        patch,
        &repo,
        &aliases,
    )))
}

#[cfg(test)]
mod routes {
    use std::net::SocketAddr;

    use axum::extract::connect_info::MockConnectInfo;
    use axum::http::StatusCode;
    use pretty_assertions::assert_eq;
    use radicle::storage::ReadStorage;
    use serde_json::json;

    use crate::test::*;

    #[tokio::test]
    async fn test_projects_root() {
        let tmp = tempfile::tempdir().unwrap();
        let seed = seed(tmp.path());
        let app = super::router(seed.clone())
            .layer(MockConnectInfo(SocketAddr::from(([127, 0, 0, 1], 8080))));
        let response = get(&app, "/projects?show=all").await;

        assert_eq!(response.status(), StatusCode::OK);
        assert_eq!(
            response.json().await,
            json!([
              {
                "name": "hello-world",
                "description": "Rad repository for tests",
                "defaultBranch": "master",
                "delegates": [
                  {
                    "id": DID,
                    "alias": CONTRIBUTOR_ALIAS
                  },
                ],
                "threshold": 1,
                "visibility": {
                  "type": "public"
                },
                "head": HEAD,
                "patches": {
                  "open": 1,
                  "draft": 0,
                  "archived": 0,
                  "merged": 0,
                },
                "issues": {
                  "open": 1,
                  "closed": 0,
                },
                "id": RID,
                "seeding": 0,
              },
              {
                "name": "again-hello-world",
                "description": "Rad repository for sorting",
                "defaultBranch": "master",
                "delegates": [
                  {
                    "id": DID,
                    "alias": CONTRIBUTOR_ALIAS
                  }
                ],
                "threshold": 1,
                "visibility": {
                  "type": "public"
                },
                "head": "344dcd184df5bf37aab6c107fa9371a1c5b3321a",
                "patches": {
                  "open": 0,
                  "draft": 0,
                  "archived": 0,
                  "merged": 0,
                },
                "issues": {
                  "open": 0,
                  "closed": 0,
                },
                "id": "rad:z4GypKmh1gkEfmkXtarcYnkvtFUfE",
                "seeding": 0,
              },
            ])
        );

        let app = super::router(seed).layer(MockConnectInfo(SocketAddr::from((
            [192, 168, 13, 37],
            8080,
        ))));
        let response = get(&app, "/projects?show=all").await;

        assert_eq!(response.status(), StatusCode::OK);
        assert_eq!(
            response.json().await,
            json!([
              {
                "name": "hello-world",
                "description": "Rad repository for tests",
                "defaultBranch": "master",
                "delegates": [
                  {
                    "id": DID,
                    "alias": CONTRIBUTOR_ALIAS
                  }
                ],
                "threshold": 1,
                "visibility": {
                  "type": "public"
                },
                "head": HEAD,
                "patches": {
                  "open": 1,
                  "draft": 0,
                  "archived": 0,
                  "merged": 0,
                },
                "issues": {
                  "open": 1,
                  "closed": 0,
                },
                "id": RID,
                "seeding": 0,
              },
              {
                "name": "again-hello-world",
                "description": "Rad repository for sorting",
                "defaultBranch": "master",
                "delegates": [
                  {
                    "id": DID,
                    "alias": CONTRIBUTOR_ALIAS
                  },
                ],
                "threshold": 1,
                "visibility": {
                  "type": "public"
                },
                "head": "344dcd184df5bf37aab6c107fa9371a1c5b3321a",
                "patches": {
                  "open": 0,
                  "draft": 0,
                  "archived": 0,
                  "merged": 0,
                },
                "issues": {
                  "open": 0,
                  "closed": 0,
                },
                "id": "rad:z4GypKmh1gkEfmkXtarcYnkvtFUfE",
                "seeding": 0,
              },
            ])
        );
    }

    #[tokio::test]
    async fn test_projects() {
        let tmp = tempfile::tempdir().unwrap();
        let app = super::router(seed(tmp.path()));
        let response = get(&app, format!("/projects/{RID}")).await;

        assert_eq!(response.status(), StatusCode::OK);
        assert_eq!(
            response.json().await,
            json!({
               "name": "hello-world",
               "description": "Rad repository for tests",
               "defaultBranch": "master",
               "delegates": [
                 {
                   "id": DID,
                   "alias": CONTRIBUTOR_ALIAS,
                 }
               ],
               "threshold": 1,
               "visibility": {
                 "type": "public"
               },
               "head": HEAD,
               "patches": {
                 "open": 1,
                 "draft": 0,
                 "archived": 0,
                 "merged": 0,
               },
               "issues": {
                 "open": 1,
                 "closed": 0,
               },
               "id": RID,
               "seeding": 0,
            })
        );
    }

    #[tokio::test]
    async fn test_search_projects() {
        let tmp = tempfile::tempdir().unwrap();
        let app = super::router(seed(tmp.path()));
        let response = get(&app, "/projects/search?q=hello").await;

        assert_eq!(response.status(), StatusCode::OK);
        assert_eq!(
            response.json().await,
            json!([
              {
                "rid": "rad:z4FucBZHZMCsxTyQE1dfE2YR59Qbp",
                "name": "hello-world",
                "description": "Rad repository for tests",
                "defaultBranch": "master",
                "delegates": [
                  {
                    "id": DID,
                    "alias": CONTRIBUTOR_ALIAS
                  }
                ],
                "seeds": 0,
              },
              {
                "rid": "rad:z4GypKmh1gkEfmkXtarcYnkvtFUfE",
                "name": "again-hello-world",
                "description": "Rad repository for sorting",
                "defaultBranch": "master",
                "delegates": [
                  {
                    "id": DID,
                    "alias": CONTRIBUTOR_ALIAS
                  },
                ],
                "seeds": 0,
              },
            ])
        );
    }

    #[tokio::test]
    async fn test_search_projects_pagination() {
        let tmp = tempfile::tempdir().unwrap();
        let app = super::router(seed(tmp.path()));
        let response = get(&app, "/projects/search?q=hello&perPage=1").await;

        assert_eq!(response.status(), StatusCode::OK);
        assert_eq!(
            response.json().await,
            json!([
              {
                "rid": "rad:z4FucBZHZMCsxTyQE1dfE2YR59Qbp",
                "name": "hello-world",
                "description": "Rad repository for tests",
                "defaultBranch": "master",
                "delegates": [
                  {
                    "id": DID,
                    "alias": CONTRIBUTOR_ALIAS,
                  }
                ],
                "seeds": 0,
              },
            ])
        );
    }

    #[tokio::test]
    async fn test_projects_not_found() {
        let tmp = tempfile::tempdir().unwrap();
        let app = super::router(seed(tmp.path()));
        let response = get(&app, "/projects/rad:z2u2CP3ZJzB7ZqE8jHrau19yjcfCQ").await;

        assert_eq!(response.status(), StatusCode::NOT_FOUND);
    }

    #[tokio::test]
    async fn test_projects_commits_root() {
        let tmp = tempfile::tempdir().unwrap();
        let app = super::router(seed(tmp.path()));
        let response = get(&app, format!("/projects/{RID}/commits")).await;

        assert_eq!(response.status(), StatusCode::OK);
        assert_eq!(
            response.json().await,
            json!([
                {
                  "id": HEAD,
                  "author": {
                    "name": "Alice Liddell",
                    "email": "alice@radicle.xyz"
                  },
                  "summary": "Add another folder",
                  "description": "",
                  "parents": [
                    "ee8d6a29304623a78ebfa5eeed5af674d0e58f83",
                  ],
                  "committer": {
                    "name": "Alice Liddell",
                    "email": "alice@radicle.xyz",
                    "time": 1673003014
                  },
                },
                {
                  "id": PARENT,
                  "author": {
                    "name": "Alice Liddell",
                    "email": "alice@radicle.xyz"
                  },
                  "summary": "Add contributing file",
                  "description": "",
                  "parents": [
                    "f604ce9fd5b7cc77b7609beda45ea8760bee78f7",
                  ],
                  "committer": {
                    "name": "Alice Liddell",
                    "email": "alice@radicle.xyz",
                    "time": 1673002014,
                  },
                },
                {
                  "id": INITIAL_COMMIT,
                  "author": {
                    "name": "Alice Liddell",
                    "email": "alice@radicle.xyz",
                  },
                  "summary": "Initial commit",
                  "description": "",
                  "parents": [],
                  "committer": {
                    "name": "Alice Liddell",
                    "email": "alice@radicle.xyz",
                    "time": 1673001014,
                  },
                },
            ])
        );
    }

    #[tokio::test]
    async fn test_projects_commits() {
        let tmp = tempfile::tempdir().unwrap();
        let app = super::router(seed(tmp.path()));
        let response = get(&app, format!("/projects/{RID}/commits/{HEAD}")).await;

        assert_eq!(response.status(), StatusCode::OK);
        assert_eq!(
            response.json().await,
            json!({
              "commit": {
                "id": HEAD,
                "author": {
                  "name": "Alice Liddell",
                  "email": "alice@radicle.xyz"
                },
                "summary": "Add another folder",
                "description": "",
                "parents": [
                  "ee8d6a29304623a78ebfa5eeed5af674d0e58f83",
                ],
                "committer": {
                  "name": "Alice Liddell",
                  "email": "alice@radicle.xyz",
                  "time": 1673003014
                },
              },
              "diff": {
                "files": [
                  {
                    "state": "deleted",
                    "path": "CONTRIBUTING",
                    "diff": {
                      "type": "plain",
                      "hunks": [
                        {
                          "header": "@@ -1 +0,0 @@\n",
                          "lines": [
                            {
                              "line": "Thank you very much!\n",
                              "lineNo": 1,
                              "type": "deletion",
                            },
                          ],
                          "old":  {
                            "start": 1,
                            "end": 2,
                          },
                          "new": {
                            "start": 0,
                            "end": 0,
                          },
                        },
                      ],
                      "stats": {
                        "additions": 0,
                        "deletions": 1,
                      },
                      "eof": "noneMissing",
                    },
                    "old": {
                      "oid": "82eb77880c693655bce074e3dbbd9fa711dc018b",
                      "mode": "blob",
                    },
                  },
                  {
                    "state": "added",
                    "path": "README",
                    "diff": {
                      "type": "plain",
                      "hunks": [
                        {
                          "header": "@@ -0,0 +1 @@\n",
                          "lines": [
                            {
                              "line": "Hello World!\n",
                              "lineNo": 1,
                              "type": "addition",
                            },
                          ],
                          "old":  {
                            "start": 0,
                            "end": 0,
                          },
                          "new": {
                            "start": 1,
                            "end": 2,
                          },
                        },
                      ],
                      "stats": {
                        "additions": 1,
                        "deletions": 0,
                      },
                      "eof": "noneMissing",
                    },
                    "new": {
                      "oid": "980a0d5f19a64b4b30a87d4206aade58726b60e3",
                      "mode": "blob",
                    },
                  },
                  {
                    "state": "added",
                    "path": "dir1/README",
                    "diff": {
                      "type": "plain",
                      "hunks": [
                        {
                          "header": "@@ -0,0 +1 @@\n",
                          "lines": [
                            {
                              "line": "Hello World from dir1!\n",
                              "lineNo": 1,
                              "type": "addition"
                            }
                          ],
                          "old":  {
                            "start": 0,
                            "end": 0,
                          },
                          "new": {
                            "start": 1,
                            "end": 2,
                          },
                        }
                      ],
                      "stats": {
                        "additions": 1,
                        "deletions": 0,
                      },
                      "eof": "noneMissing",
                    },
                    "new": {
                      "oid": "1dd5654ca2d2cf9f33b14c92b5ca9e1d21a91ae1",
                      "mode": "blob",
                    },
                  },
                ],
                "stats": {
                  "filesChanged": 3,
                  "insertions": 2,
                  "deletions": 1
                }
              },
              "files": {
                "82eb77880c693655bce074e3dbbd9fa711dc018b": {
                  "id": "82eb77880c693655bce074e3dbbd9fa711dc018b",
                  "binary": false,
                  "content": "Thank you very much!\n",
                },
                "980a0d5f19a64b4b30a87d4206aade58726b60e3": {
                  "id": "980a0d5f19a64b4b30a87d4206aade58726b60e3",
                  "binary": false,
                  "content": "Hello World!\n",
                },
                "1dd5654ca2d2cf9f33b14c92b5ca9e1d21a91ae1": {
                  "id": "1dd5654ca2d2cf9f33b14c92b5ca9e1d21a91ae1",
                  "binary": false,
                  "content": "Hello World from dir1!\n",
                },
              },
              "branches": [
                "refs/heads/master"
              ]
            })
        );
    }

    #[tokio::test]
    async fn test_projects_commits_not_found() {
        let tmp = tempfile::tempdir().unwrap();
        let app = super::router(seed(tmp.path()));
        let response = get(
            &app,
            format!("/projects/{RID}/commits/ffffffffffffffffffffffffffffffffffffffff"),
        )
        .await;

        assert_eq!(response.status(), StatusCode::NOT_FOUND);
    }

    #[tokio::test]
    async fn test_projects_stats() {
        let tmp = tempfile::tempdir().unwrap();
        let app = super::router(seed(tmp.path()));
        let response = get(&app, format!("/projects/{RID}/stats/tree/{HEAD}")).await;

        assert_eq!(response.status(), StatusCode::OK);
        assert_eq!(
            response.json().await,
            json!(
              {
                "commits": 3,
                "branches": 1,
                "contributors": 1
              }
            )
        );
    }

    #[tokio::test]
    async fn test_projects_tree() {
        let tmp = tempfile::tempdir().unwrap();
        let app = super::router(seed(tmp.path()));
        let response = get(&app, format!("/projects/{RID}/tree/{HEAD}/")).await;

        assert_eq!(response.status(), StatusCode::OK);
        assert_eq!(
            response.json().await,
            json!({
                "entries": [
                  {
                    "path": "dir1",
                    "oid": "2d1c3cbfcf1d190d7fc77ac8f9e53db0e91a9ad3",
                    "name": "dir1",
                    "kind": "tree"
                  },
                  {
                    "path": "README",
                    "oid": "980a0d5f19a64b4b30a87d4206aade58726b60e3",
                    "name": "README",
                    "kind": "blob"
                  }
                ],
                "lastCommit": {
                  "id": HEAD,
                  "author": {
                    "name": "Alice Liddell",
                    "email": "alice@radicle.xyz"
                  },
                  "summary": "Add another folder",
                  "description": "",
                  "parents": [
                    "ee8d6a29304623a78ebfa5eeed5af674d0e58f83",
                  ],
                  "committer": {
                    "name": "Alice Liddell",
                    "email": "alice@radicle.xyz",
                    "time": 1673003014
                  },
                },
                "name": "",
                "path": "",
              }
            )
        );

        let response = get(&app, format!("/projects/{RID}/tree/{HEAD}/dir1")).await;

        assert_eq!(response.status(), StatusCode::OK);
        assert_eq!(
            response.json().await,
            json!({
              "entries": [
                {
                  "path": "dir1/README",
                  "oid": "1dd5654ca2d2cf9f33b14c92b5ca9e1d21a91ae1",
                  "name": "README",
                  "kind": "blob"
                }
              ],
              "lastCommit": {
                "id": HEAD,
                "author": {
                  "name": "Alice Liddell",
                  "email": "alice@radicle.xyz"
                },
                "summary": "Add another folder",
                "description": "",
                "parents": [
                  "ee8d6a29304623a78ebfa5eeed5af674d0e58f83",
                ],
                "committer": {
                  "name": "Alice Liddell",
                  "email": "alice@radicle.xyz",
                  "time": 1673003014
                },
              },
              "name": "dir1",
              "path": "dir1",
            })
        );
    }

    #[tokio::test]
    async fn test_projects_tree_not_found() {
        let tmp = tempfile::tempdir().unwrap();
        let app = super::router(seed(tmp.path()));
        let response = get(
            &app,
            format!("/projects/{RID}/tree/ffffffffffffffffffffffffffffffffffffffff"),
        )
        .await;
        assert_eq!(response.status(), StatusCode::NOT_FOUND);

        let response = get(&app, format!("/projects/{RID}/tree/{HEAD}/unknown")).await;
        assert_eq!(response.status(), StatusCode::NOT_FOUND);
    }

    #[tokio::test]
    async fn test_projects_remotes_root() {
        let tmp = tempfile::tempdir().unwrap();
        let app = super::router(seed(tmp.path()));
        let response = get(&app, format!("/projects/{RID}/remotes")).await;

        assert_eq!(response.status(), StatusCode::OK);
        assert_eq!(
            response.json().await,
            json!([
              {
                "id": "z6MknSLrJoTcukLrE435hVNQT4JUhbvWLX4kUzqkEStBU8Vi",
                "alias": CONTRIBUTOR_ALIAS,
                "heads": {
                  "master": HEAD
                },
                "delegate": true
              }
            ])
        );
    }

    #[tokio::test]
    async fn test_projects_remotes() {
        let tmp = tempfile::tempdir().unwrap();
        let app = super::router(seed(tmp.path()));
        let response = get(
            &app,
            format!("/projects/{RID}/remotes/z6MknSLrJoTcukLrE435hVNQT4JUhbvWLX4kUzqkEStBU8Vi"),
        )
        .await;

        assert_eq!(response.status(), StatusCode::OK);
        assert_eq!(
            response.json().await,
            json!({
                "id": "z6MknSLrJoTcukLrE435hVNQT4JUhbvWLX4kUzqkEStBU8Vi",
                "heads": {
                    "master": HEAD
                },
                "delegate": true
            })
        );
    }

    #[tokio::test]
    async fn test_projects_remotes_not_found() {
        let tmp = tempfile::tempdir().unwrap();
        let app = super::router(seed(tmp.path()));
        let response = get(
            &app,
            format!("/projects/{RID}/remotes/z6MksFqXN3Yhqk8pTJdUGLwATkRfQvwZXPqR2qMEhbS9wzpT"),
        )
        .await;

        assert_eq!(response.status(), StatusCode::NOT_FOUND);
    }

    #[tokio::test]
    async fn test_projects_blob() {
        let tmp = tempfile::tempdir().unwrap();
        let app = super::router(seed(tmp.path()));
        let response = get(&app, format!("/projects/{RID}/blob/{HEAD}/README")).await;

        assert_eq!(response.status(), StatusCode::OK);
        assert_eq!(
            response.json().await,
            json!({
                "binary": false,
                "name": "README",
                "path": "README",
                "lastCommit": {
                  "id": HEAD,
                  "author": {
                    "name": "Alice Liddell",
                    "email": "alice@radicle.xyz"
                  },
                  "summary": "Add another folder",
                  "description": "",
                  "parents": [
                    "ee8d6a29304623a78ebfa5eeed5af674d0e58f83"
                  ],
                  "committer": {
                    "name": "Alice Liddell",
                    "email": "alice@radicle.xyz",
                    "time": 1673003014
                  },
                },
                "content": "Hello World!\n",
            })
        );
    }

    #[tokio::test]
    async fn test_projects_blob_not_found() {
        let tmp = tempfile::tempdir().unwrap();
        let app = super::router(seed(tmp.path()));
        let response = get(&app, format!("/projects/{RID}/blob/{HEAD}/unknown")).await;

        assert_eq!(response.status(), StatusCode::NOT_FOUND);
    }

    #[tokio::test]
    async fn test_projects_readme() {
        let tmp = tempfile::tempdir().unwrap();
        let app = super::router(seed(tmp.path()));
        let response = get(&app, format!("/projects/{RID}/readme/{INITIAL_COMMIT}")).await;

        assert_eq!(response.status(), StatusCode::OK);
        assert_eq!(
            response.json().await,
            json!({
                "binary": false,
                "name": "README",
                "path": "README",
                "lastCommit": {
                  "id": INITIAL_COMMIT,
                  "author": {
                    "name": "Alice Liddell",
                    "email": "alice@radicle.xyz"
                  },
                  "summary": "Initial commit",
                  "description": "",
                  "parents": [],
                  "committer": {
                    "name": "Alice Liddell",
                    "email": "alice@radicle.xyz",
                    "time": 1673001014
                  },
                },
                "content": "Hello World!\n"
            })
        );
    }

    #[tokio::test]
    async fn test_projects_diff() {
        let tmp = tempfile::tempdir().unwrap();
        let app = super::router(seed(tmp.path()));
        let response = get(
            &app,
            format!("/projects/{RID}/diff/{INITIAL_COMMIT}/{HEAD}"),
        )
        .await;

        assert_eq!(response.status(), StatusCode::OK);
        assert_eq!(
            response.json().await,
            json!({
                "diff": {
                  "files": [
                    {
                      "state": "added",
                      "path": "dir1/README",
                      "diff": {
                        "type": "plain",
                        "hunks": [
                          {
                            "header": "@@ -0,0 +1 @@\n",
                            "lines": [
                              {
                                "line": "Hello World from dir1!\n",
                                "lineNo": 1,
                                "type": "addition",
                              },
                            ],
                            "old":  {
                              "start": 0,
                              "end": 0,
                            },
                            "new": {
                              "start": 1,
                              "end": 2,
                            },
                          },
                        ],
                        "stats": {
                          "additions": 1,
                          "deletions": 0,
                        },
                        "eof": "noneMissing",
                      },
                      "new": {
                        "oid": "1dd5654ca2d2cf9f33b14c92b5ca9e1d21a91ae1",
                        "mode": "blob",
                      },
                    },
                  ],
                  "stats": {
                    "filesChanged": 1,
                    "insertions": 1,
                    "deletions": 0,
                  },
                },
                "files": {
                  "1dd5654ca2d2cf9f33b14c92b5ca9e1d21a91ae1": {
                    "id": "1dd5654ca2d2cf9f33b14c92b5ca9e1d21a91ae1",
                    "binary": false,
                    "content": "Hello World from dir1!\n",
                  },
                },
                "commits": [
                  {
                    "id": HEAD,
                    "author": {
                      "name": "Alice Liddell",
                      "email": "alice@radicle.xyz",
                    },
                    "summary": "Add another folder",
                    "description": "",
                    "parents": [
                      "ee8d6a29304623a78ebfa5eeed5af674d0e58f83"
                    ],
                    "committer": {
                      "name": "Alice Liddell",
                      "email": "alice@radicle.xyz",
                      "time": 1673003014,
                    },
                  },
                  {
                    "id": PARENT,
                    "author": {
                      "name": "Alice Liddell",
                      "email": "alice@radicle.xyz",
                    },
                    "summary": "Add contributing file",
                    "description": "",
                    "parents": [
                      "f604ce9fd5b7cc77b7609beda45ea8760bee78f7",
                    ],
                    "committer": {
                      "name": "Alice Liddell",
                      "email": "alice@radicle.xyz",
                      "time": 1673002014,
                    }
                  }
                ],
            })
        );
    }

    #[tokio::test]
    async fn test_projects_issues_root() {
        let tmp = tempfile::tempdir().unwrap();
        let app = super::router(seed(tmp.path()));
        let response = get(&app, format!("/projects/{RID}/issues")).await;

        assert_eq!(response.status(), StatusCode::OK);
        assert_eq!(
            response.json().await,
            json!([
              {
                "id": ISSUE_ID,
                "author": {
                  "id": DID,
                  "alias": CONTRIBUTOR_ALIAS
                },
                "title": "Issue #1",
                "state": {
                  "status": "open"
                },
                "assignees": [],
                "discussion": [
                  {
                    "id": ISSUE_ID,
                    "author": {
                      "id": DID,
                      "alias": CONTRIBUTOR_ALIAS
                    },
                    "body": "Change 'hello world' to 'hello everyone'",
                    "edits": [
                      {
                        "author": {
                          "id": DID,
                          "alias": CONTRIBUTOR_ALIAS
                        },
                        "body": "Change 'hello world' to 'hello everyone'",
                        "timestamp": TIMESTAMP,
                        "embeds": [],
                      },
                    ],
                    "embeds": [],
                    "reactions": [],
                    "timestamp": TIMESTAMP,
                    "replyTo": null,
                    "resolved": false,
                  }
                ],
                "labels": []
              }
            ])
        );
    }

    #[tokio::test]
    async fn test_projects_issue() {
        let tmp = tempfile::tempdir().unwrap();
        let app = super::router(seed(tmp.path()));
        let response = get(&app, format!("/projects/{RID}/issues/{ISSUE_ID}")).await;

        assert_eq!(response.status(), StatusCode::OK);
        assert_eq!(
            response.json().await,
            json!({
                "id": ISSUE_ID,
                "author": {
                  "id": DID,
                  "alias": CONTRIBUTOR_ALIAS
                },
                "title": "Issue #1",
                "state": {
                  "status": "open"
                },
                "assignees": [],
                "discussion": [
                  {
                    "id": ISSUE_ID,
                    "author": {
                      "id": DID,
                      "alias": CONTRIBUTOR_ALIAS
                    },
                    "body": "Change 'hello world' to 'hello everyone'",
                    "edits": [
                      {
                        "author": {
                          "id": DID,
                          "alias": CONTRIBUTOR_ALIAS
                        },
                        "body": "Change 'hello world' to 'hello everyone'",
                        "timestamp": TIMESTAMP,
                        "embeds": [],
                      },
                    ],
                    "embeds": [],
                    "reactions": [],
                    "timestamp": TIMESTAMP,
                    "replyTo": null,
                    "resolved": false,
                  }
                ],
                "labels": []
            })
        );
    }

    #[tokio::test]
    async fn test_projects_patches_root() {
        let tmp = tempfile::tempdir().unwrap();
        let app = super::router(seed(tmp.path()));
        let response = get(&app, format!("/projects/{RID}/patches")).await;

        assert_eq!(response.status(), StatusCode::OK);
        assert_eq!(
            response.json().await,
            json!([
                {
                    "id": PATCH_ID,
                    "author": {
                        "id": DID,
                        "alias": CONTRIBUTOR_ALIAS,
                    },
                    "title": "A new `hello world`",
                    "state": {
                        "status": "open",
                    },
                    "target": "delegates",
                    "labels": [],
                    "merges": [],
                    "assignees": [],
                    "revisions": [
                        {
                            "id": PATCH_ID,
                            "author": {
                                "id": DID,
                                "alias": CONTRIBUTOR_ALIAS,
                            },
                            "description": "change `hello world` in README to something else",
                            "edits": [
                                {
                                    "author": {
                                        "id": DID,
                                        "alias": CONTRIBUTOR_ALIAS,
                                    },
                                    "body": "change `hello world` in README to something else",
                                    "timestamp": TIMESTAMP,
                                    "embeds": [],
                                },
                            ],
                            "reactions": [],
                            "base": "ee8d6a29304623a78ebfa5eeed5af674d0e58f83",
                            "oid": "e8c676b9e3b42308dc9d218b70faa5408f8e58ca",
                            "refs": [
                                "refs/heads/master",
                            ],
                            "discussions": [],
                            "timestamp": TIMESTAMP,
                            "reviews": [],
                        },
                    ],
                },
                ]
            )
        );
    }

    #[tokio::test]
    async fn test_projects_patch() {
        let tmp = tempfile::tempdir().unwrap();
        let app = super::router(seed(tmp.path()));
        let response = get(&app, format!("/projects/{RID}/patches/{PATCH_ID}")).await;

        assert_eq!(response.status(), StatusCode::OK);
        assert_eq!(
            response.json().await,
            json!({
                "id": PATCH_ID,
                "author": {
                    "id": DID,
                    "alias": CONTRIBUTOR_ALIAS,
                },
                "title": "A new `hello world`",
                "state": {
                    "status": "open",
                },
                "target": "delegates",
                "labels": [],
                "merges": [],
                "assignees": [],
                "revisions": [
                    {
                        "id": PATCH_ID,
                        "author": {
                            "id": DID,
                            "alias": CONTRIBUTOR_ALIAS,
                        },
                        "description": "change `hello world` in README to something else",
                        "edits": [
                            {
                                "author": {
                                    "id": DID,
                                    "alias": CONTRIBUTOR_ALIAS,
                                },
                                "body": "change `hello world` in README to something else",
                                "timestamp": TIMESTAMP,
                                "embeds": [],
                            },
                        ],
                        "reactions": [],
                        "base": "ee8d6a29304623a78ebfa5eeed5af674d0e58f83",
                        "oid": "e8c676b9e3b42308dc9d218b70faa5408f8e58ca",
                        "refs": [
                            "refs/heads/master",
                        ],
                        "discussions": [],
                        "timestamp": TIMESTAMP,
                        "reviews": [],
                    },
                ],
            })
        );
    }

    #[tokio::test]
    async fn test_projects_private() {
        let tmp = tempfile::tempdir().unwrap();
        let ctx = seed(tmp.path());
        let app = super::router(ctx.to_owned());

        // Check that the repo exists.
        ctx.profile()
            .storage
            .repository(RID_PRIVATE.parse().unwrap())
            .unwrap();

        let response = get(&app, format!("/projects/{RID_PRIVATE}")).await;
        assert_eq!(response.status(), StatusCode::NOT_FOUND);

        let response = get(&app, format!("/projects/{RID_PRIVATE}/patches")).await;
        assert_eq!(response.status(), StatusCode::NOT_FOUND);

        let response = get(&app, format!("/projects/{RID_PRIVATE}/issues")).await;
        assert_eq!(response.status(), StatusCode::NOT_FOUND);

        let response = get(&app, format!("/projects/{RID_PRIVATE}/commits")).await;
        assert_eq!(response.status(), StatusCode::NOT_FOUND);

        let response = get(&app, format!("/projects/{RID_PRIVATE}/remotes")).await;
        assert_eq!(response.status(), StatusCode::NOT_FOUND);
    }
}
