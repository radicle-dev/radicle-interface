use axum::extract::State;
use axum::response::IntoResponse;
use axum::routing::{get, put};
use axum::{Json, Router};
use axum_auth::AuthBearer;
use hyper::StatusCode;
use serde_json::json;

use radicle::identity::RepoId;
use radicle::node::address::Store as AddressStore;
use radicle::node::routing::Store;
use radicle::node::{AliasStore, Handle, NodeId, DEFAULT_TIMEOUT};
use radicle::Node;

use crate::api::error::Error;
use crate::api::{self, Context, PoliciesQuery};
use crate::axum_extra::{Path, Query};

pub fn router(ctx: Context) -> Router {
    Router::new()
        .route("/node", get(node_handler))
        .route("/node/policies/repos", get(node_policies_repos_handler))
        .route(
            "/node/policies/repos/:rid",
            put(node_policies_seed_handler)
                .delete(node_policies_unseed_handler)
                .get(node_policies_repo_handler),
        )
        .route("/nodes/:nid", get(nodes_handler))
        .route("/nodes/:nid/inventory", get(nodes_inventory_handler))
        .with_state(ctx)
}

/// Return local node information.
/// `GET /node`
async fn node_handler(State(ctx): State<Context>) -> impl IntoResponse {
    let node = Node::new(ctx.profile.socket());
    let node_id = ctx.profile.public_key;
    let home = ctx.profile.home.database()?;
    let agent = AddressStore::get(&home, &node_id)
        .unwrap_or_default()
        .map(|node| node.agent);
    let node_state = if node.is_running() {
        "running"
    } else {
        "stopped"
    };
    let config = match node.config() {
        Ok(config) => Some(config),
        Err(err) => {
            tracing::error!("Error getting node config: {:#}", err);
            None
        }
    };
    let response = json!({
        "id": node_id.to_string(),
        "agent": agent,
        "config": config,
        "state": node_state,
    });

    Ok::<_, Error>(Json(response))
}

/// Return stored information about other nodes.
/// `GET /nodes/:nid`
async fn nodes_handler(State(ctx): State<Context>, Path(nid): Path<NodeId>) -> impl IntoResponse {
    let aliases = ctx.profile.aliases();
    let response = json!({
        "alias": aliases.alias(&nid),
    });

    Ok::<_, Error>(Json(response))
}

/// Return stored information about other nodes.
/// `GET /nodes/:nid/inventory`
async fn nodes_inventory_handler(
    State(ctx): State<Context>,
    Path(nid): Path<NodeId>,
) -> impl IntoResponse {
    let db = &ctx.profile.database()?;
    let resources = db.get_inventory(&nid)?;

    Ok::<_, Error>(Json(resources))
}

/// Return local repo policies information.
/// `GET /node/policies/repos`
async fn node_policies_repos_handler(State(ctx): State<Context>) -> impl IntoResponse {
    let policies = ctx.profile.policies()?;
    let policies = policies.seed_policies()?.collect::<Vec<_>>();

    Ok::<_, Error>(Json(policies))
}

/// Return local repo policy information.
/// `GET /node/policies/repos/:rid`
async fn node_policies_repo_handler(
    State(ctx): State<Context>,
    Path(rid): Path<RepoId>,
) -> impl IntoResponse {
    let policies = ctx.profile.policies()?;
    let policy = policies.seed_policy(&rid)?;

    Ok::<_, Error>(Json(*policy))
}

/// Seed a new repo.
/// `PUT /node/policies/repos/:rid`
async fn node_policies_seed_handler(
    State(ctx): State<Context>,
    AuthBearer(token): AuthBearer,
    Path(project): Path<RepoId>,
    Query(qs): Query<PoliciesQuery>,
) -> impl IntoResponse {
    api::auth::validate(&ctx, &token).await?;
    let mut node = Node::new(ctx.profile.socket());
    node.seed(project, qs.scope.unwrap_or_default())?;

    if let Some(from) = qs.from {
        let results = node.fetch(project, from, DEFAULT_TIMEOUT)?;
        return Ok::<_, Error>((
            StatusCode::OK,
            Json(json!({ "success": true, "results": results })),
        ));
    }
    Ok::<_, Error>((StatusCode::OK, Json(json!({ "success": true }))))
}

/// Unseed a repo.
/// `DELETE /node/policies/repos/:rid`
async fn node_policies_unseed_handler(
    State(ctx): State<Context>,
    AuthBearer(token): AuthBearer,
    Path(project): Path<RepoId>,
) -> impl IntoResponse {
    api::auth::validate(&ctx, &token).await?;
    let mut node = Node::new(ctx.profile.socket());
    node.unseed(project)?;

    Ok::<_, Error>((StatusCode::OK, Json(json!({ "success": true }))))
}

#[cfg(test)]
mod routes {
    use std::net::SocketAddr;

    use axum::extract::connect_info::MockConnectInfo;
    use axum::http::StatusCode;
    use pretty_assertions::assert_eq;
    use serde_json::json;

    use crate::test::*;

    #[tokio::test]
    async fn test_node_repos_policies() {
        let tmp = tempfile::tempdir().unwrap();
        let seed = seed(tmp.path());
        let app = super::router(seed.clone())
            .layer(MockConnectInfo(SocketAddr::from(([127, 0, 0, 1], 8080))));
        let response = get(&app, "/node/policies/repos").await;

        assert_eq!(response.status(), StatusCode::OK);
        assert_eq!(
            response.json().await,
            json!([
                {
                    "rid": "rad:zLuTzcmoWMcdK37xqArS8eckp9vK",
                    "policy": {
                        "policy": "block",
                    }
                },
                {
                    "rid": "rad:z4FucBZHZMCsxTyQE1dfE2YR59Qbp",
                    "policy": {
                        "policy": "allow",
                        "scope": "all",
                    }
                },
                {
                    "rid": "rad:z4GypKmh1gkEfmkXtarcYnkvtFUfE",
                    "policy": {
                        "policy": "allow",
                        "scope" : "followed"
                    }
                },
            ])
        );
    }

    #[tokio::test]
    async fn test_node_repo_policies() {
        let tmp = tempfile::tempdir().unwrap();
        let seed = seed(tmp.path());
        let app = super::router(seed.clone())
            .layer(MockConnectInfo(SocketAddr::from(([127, 0, 0, 1], 8080))));
        let response = get(
            &app,
            "/node/policies/repos/rad:zLuTzcmoWMcdK37xqArS8eckp9vK",
        )
        .await;

        assert_eq!(response.status(), StatusCode::OK);
        assert_eq!(
            response.json().await,
            json!({
                "policy": "block",
            })
        );
    }

    #[tokio::test]
    async fn test_nodes() {
        let tmp = tempfile::tempdir().unwrap();
        let seed = seed(tmp.path());
        let app = super::router(seed.clone())
            .layer(MockConnectInfo(SocketAddr::from(([127, 0, 0, 1], 8080))));
        let nid = seed.profile().id();
        let response = get(&app, format!("/nodes/{nid}")).await;

        assert_eq!(response.status(), StatusCode::OK);
        assert_eq!(
            response.json().await,
            json!({
                "alias": "seed",
            })
        );
    }

    #[tokio::test]
    async fn test_nodes_inventory() {
        let tmp = tempfile::tempdir().unwrap();
        let seed = seed(tmp.path());
        let app = super::router(seed.clone())
            .layer(MockConnectInfo(SocketAddr::from(([127, 0, 0, 1], 8080))));
        let nid = seed.profile().public_key;
        let response = get(&app, format!("/nodes/{nid}/inventory")).await;

        assert_eq!(response.status(), StatusCode::OK);
        assert_eq!(response.json().await, json!([]));
    }
}
