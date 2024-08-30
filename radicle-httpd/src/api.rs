use std::collections::BTreeMap;
use std::sync::Arc;
use std::time::Duration;

use axum::http::header::CONTENT_TYPE;
use axum::http::Method;
use axum::response::{IntoResponse, Json};
use axum::routing::get;
use axum::Router;
use radicle::identity::doc::PayloadId;
use radicle::issue::cache::Issues as _;
use radicle::patch::cache::Patches as _;
use radicle::storage::git::Repository;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tower_http::cors::{self, CorsLayer};

use radicle::cob::{issue, patch, Author};
use radicle::identity::{DocAt, RepoId};
use radicle::node::policy::Scope;
use radicle::node::routing::Store;
use radicle::node::{AliasStore, NodeId};
use radicle::storage::{ReadRepository, ReadStorage};
use radicle::Profile;

mod error;
mod json;
mod v1;

use crate::api::error::Error;
use crate::cache::Cache;
use crate::Options;

pub const RADICLE_VERSION: &str = env!("RADICLE_VERSION");
// This version has to be updated on every breaking change to the radicle-httpd API.
pub const API_VERSION: &str = "6.0.0";

#[derive(Clone)]
pub struct Context {
    profile: Arc<Profile>,
    cache: Option<Cache>,
}

impl Context {
    pub fn new(profile: Arc<Profile>, options: &Options) -> Self {
        Self {
            profile,
            cache: options.cache.map(Cache::new),
        }
    }

    pub fn repo_info<R: ReadRepository + radicle::cob::Store>(
        &self,
        repo: &R,
        doc: DocAt,
    ) -> Result<repo::Info, error::Error> {
        let DocAt { doc, .. } = doc;
        let rid = repo.id();

        let aliases = self.profile.aliases();
        let delegates = doc
            .delegates
            .into_iter()
            .map(|did| json::author(&Author::new(did), aliases.alias(did.as_key())))
            .collect::<Vec<_>>();
        let db = &self.profile.database()?;
        let seeding = db.count(&rid).unwrap_or_default();

        let payloads: BTreeMap<PayloadId, Value> = doc
            .payload
            .into_iter()
            .filter_map(|(id, payload)| match id {
                id if id == PayloadId::project() => {
                    let Ok((_, head)) = repo.head() else {
                        return None;
                    };
                    let (Ok(patches), Ok(issues)) =
                        (self.profile.patches(repo), self.profile.issues(repo))
                    else {
                        return None;
                    };
                    let (Ok(patches), Ok(issues)) = (patches.counts(), issues.counts()) else {
                        return None;
                    };

                    Some((
                        id,
                        json!({
                            "data": payload,
                            "meta": {
                                "head": head,
                                "issues": issues,
                                "patches": patches
                            }
                        }),
                    ))
                }
                _ => Some((id, json!({ "data": payload }))),
            })
            .collect();

        Ok(repo::Info {
            payloads,
            delegates,
            threshold: doc.threshold,
            visibility: doc.visibility,
            rid,
            seeding,
        })
    }

    /// Get a repository by RID, checking to make sure we're allowed to view it.
    pub fn repo(&self, rid: RepoId) -> Result<(Repository, DocAt), error::Error> {
        let repo = self.profile.storage.repository(rid)?;
        let doc = repo.identity_doc()?;
        // Don't allow accessing private repos.
        if doc.visibility.is_private() {
            return Err(Error::NotFound);
        }
        Ok((repo, doc))
    }

    #[cfg(test)]
    pub fn profile(&self) -> &Arc<Profile> {
        &self.profile
    }
}

pub fn router(ctx: Context) -> Router {
    Router::new()
        .route("/", get(root_handler))
        .merge(v1::router(ctx))
        .layer(
            CorsLayer::new()
                .max_age(Duration::from_secs(86400))
                .allow_origin(cors::Any)
                .allow_methods([Method::GET])
                .allow_headers([CONTENT_TYPE]),
        )
}

async fn root_handler() -> impl IntoResponse {
    let response = json!({
        "path": "/api",
        "links": [
            {
                "href": "/v1",
                "rel": "v1",
                "type": "GET"
            }
        ]
    });

    Json(response)
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PaginationQuery {
    #[serde(default)]
    pub show: RepoQuery,
    pub page: Option<usize>,
    pub per_page: Option<usize>,
}

#[derive(Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub enum RepoQuery {
    All,
    #[default]
    Pinned,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RawQuery {
    pub mime: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CobsQuery<T> {
    pub page: Option<usize>,
    pub per_page: Option<usize>,
    pub status: Option<T>,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PoliciesQuery {
    /// The NID from which to fetch from after tracking a repo.
    pub from: Option<NodeId>,
    pub scope: Option<Scope>,
}

#[derive(Default, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub enum IssueStatus {
    Closed,
    #[default]
    Open,
    All,
}

impl IssueStatus {
    pub fn matches(&self, issue: &issue::State) -> bool {
        match self {
            Self::Open => matches!(issue, issue::State::Open),
            Self::Closed => matches!(issue, issue::State::Closed { .. }),
            Self::All => true,
        }
    }
}

#[derive(Default, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub enum PatchStatus {
    #[default]
    Open,
    Draft,
    Archived,
    Merged,
    All,
}

impl PatchStatus {
    pub fn matches(&self, patch: &patch::State) -> bool {
        match self {
            Self::Open => matches!(patch, patch::State::Open { .. }),
            Self::Draft => matches!(patch, patch::State::Draft),
            Self::Archived => matches!(patch, patch::State::Archived),
            Self::Merged => matches!(patch, patch::State::Merged { .. }),
            Self::All => true,
        }
    }
}

mod search {
    use std::cmp::Ordering;
    use std::collections::BTreeMap;

    use nonempty::NonEmpty;
    use serde::{Deserialize, Serialize};
    use serde_json::json;

    use radicle::crypto::Verified;
    use radicle::identity::doc::{Payload, PayloadId};
    use radicle::identity::RepoId;
    use radicle::node::routing::Store;
    use radicle::node::{AliasStore, Database};
    use radicle::profile::Aliases;
    use radicle::storage::RepositoryInfo;

    #[derive(Serialize, Deserialize)]
    #[serde(rename_all = "camelCase")]
    pub struct SearchQueryString {
        pub q: Option<String>,
        pub page: Option<usize>,
        pub per_page: Option<usize>,
    }

    #[derive(Serialize, Deserialize, Eq, Debug)]
    pub struct SearchResult {
        pub rid: RepoId,
        pub payloads: BTreeMap<PayloadId, Payload>,
        pub delegates: NonEmpty<serde_json::Value>,
        pub seeds: usize,
        #[serde(skip)]
        pub index: usize,
    }

    impl SearchResult {
        pub fn new(
            q: &str,
            info: RepositoryInfo<Verified>,
            db: &Database,
            aliases: &Aliases,
        ) -> Option<Self> {
            if info.doc.visibility.is_private() {
                return None;
            }
            let Ok(Some(index)) = info.doc.project().map(|p| p.name().find(q)) else {
                return None;
            };
            let seeds = db.count(&info.rid).unwrap_or_default();
            let delegates = info.doc.delegates.map(|did| match aliases.alias(&did) {
                Some(alias) => json!({
                    "id": did,
                    "alias": alias,
                }),
                None => json!({
                    "id": did,
                }),
            });

            Some(SearchResult {
                rid: info.rid,
                payloads: info.doc.payload,
                delegates,
                seeds,
                index,
            })
        }
    }

    impl Ord for SearchResult {
        fn cmp(&self, other: &Self) -> Ordering {
            match (self.index, other.index) {
                (0, 0) => self.seeds.cmp(&other.seeds),
                (0, _) => std::cmp::Ordering::Less,
                (_, 0) => std::cmp::Ordering::Greater,
                (ai, bi) if ai == bi => self.seeds.cmp(&other.seeds),
                (_, _) => self.seeds.cmp(&other.seeds),
            }
        }
    }

    impl PartialOrd for SearchResult {
        fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
            Some(self.cmp(other))
        }
    }

    impl PartialEq for SearchResult {
        fn eq(&self, other: &Self) -> bool {
            self.rid == other.rid
        }
    }
}

mod repo {
    use std::collections::BTreeMap;

    use serde::Serialize;
    use serde_json::Value;

    use radicle::identity::doc::PayloadId;
    use radicle::identity::{RepoId, Visibility};

    /// Repos info.
    #[derive(Serialize)]
    #[serde(rename_all = "camelCase")]
    pub struct Info {
        pub payloads: BTreeMap<PayloadId, Value>,
        pub delegates: Vec<Value>,
        pub threshold: usize,
        pub visibility: Visibility,
        pub rid: RepoId,
        pub seeding: usize,
    }
}
