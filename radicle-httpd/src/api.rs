use std::collections::BTreeMap;
use std::sync::Arc;

use axum::response::{IntoResponse, Json};
use axum::routing::get;
use axum::Router;
use serde_json::{json, Value};

use radicle::identity::doc::PayloadId;
use radicle::identity::{DocAt, RepoId};
use radicle::issue::cache::Issues as _;
use radicle::node::routing::Store;
use radicle::patch::cache::Patches as _;
use radicle::storage::git::Repository;
use radicle::storage::{ReadRepository, ReadStorage};
use radicle::Profile;

mod error;
mod json;
pub(crate) mod query;
mod v1;

use crate::api::error::Error;
use crate::cache::Cache;
use crate::Options;

pub const RADICLE_VERSION: &str = env!("RADICLE_VERSION");
// This version has to be updated on every breaking change to the radicle-httpd API.
pub const API_VERSION: &str = "6.1.0";

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

    #[allow(clippy::result_large_err)]
    pub fn repo_info<R: ReadRepository + radicle::cob::Store>(
        &self,
        repo: &R,
        doc: DocAt,
    ) -> Result<repo::Info, error::Error> {
        let DocAt { doc, .. } = doc;
        let rid = repo.id();

        let aliases = self.profile.aliases();
        let delegates = doc
            .delegates()
            .iter()
            .map(|did| json::Author::new(did).as_json(&aliases))
            .collect::<Vec<_>>();
        let db = &self.profile.database()?;
        let seeding = db.count(&rid).unwrap_or_default();

        let payloads: BTreeMap<PayloadId, Value> = doc
            .payload()
            .iter()
            .filter_map(|(id, payload)| {
                if id == &PayloadId::project() {
                    let (_, head) = repo.head().ok()?;
                    let patches = self.profile.patches(repo).ok()?;
                    let patches = patches.counts().ok()?;
                    let issues = self.profile.issues(repo).ok()?;
                    let issues = issues.counts().ok()?;

                    Some((
                        id.clone(),
                        json!({
                            "data": payload,
                            "meta": {
                                "head": head,
                                "issues": issues,
                                "patches": patches
                            }
                        }),
                    ))
                } else {
                    Some((id.clone(), json!({ "data": payload })))
                }
            })
            .collect();

        Ok(repo::Info {
            payloads,
            delegates,
            threshold: doc.threshold(),
            visibility: doc.visibility().clone(),
            rid,
            seeding,
        })
    }

    /// Get a repository by RID, checking to make sure we're allowed to view it.
    #[allow(clippy::result_large_err)]
    pub fn repo(&self, rid: RepoId) -> Result<(Repository, DocAt), error::Error> {
        let repo = self.profile.storage.repository(rid)?;
        let doc = repo.identity_doc()?;
        // Don't allow accessing private repos.
        if doc.visibility().is_private() {
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

mod search {
    use std::cmp::Ordering;
    use std::collections::BTreeMap;

    use serde::{Deserialize, Serialize};
    use serde_json::json;

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
        pub delegates: Vec<serde_json::Value>,
        pub seeds: usize,
        #[serde(skip)]
        pub index: usize,
    }

    impl SearchResult {
        pub fn new(
            q: &str,
            info: RepositoryInfo,
            db: &Database,
            aliases: &Aliases,
        ) -> Option<Self> {
            if info.doc.visibility().is_private() {
                return None;
            }
            let Ok(Some(index)) = info.doc.project().map(|p| p.name().find(q)) else {
                return None;
            };
            let seeds = db.count(&info.rid).unwrap_or_default();
            let delegates = info
                .doc
                .delegates()
                .iter()
                .map(|did| match aliases.alias(did) {
                    Some(alias) => json!({
                        "id": did,
                        "alias": alias,
                    }),
                    None => json!({
                        "id": did,
                    }),
                })
                .collect::<Vec<_>>();

            Some(SearchResult {
                rid: info.rid,
                payloads: info.doc.payload().clone(),
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
