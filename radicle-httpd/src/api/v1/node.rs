use axum::extract::State;
use axum::response::IntoResponse;
use axum::routing::get;
use axum::{Json, Router};
use serde_json::json;

use radicle::node::policy::{Policy, SeedPolicy};
use radicle::node::routing::Store;
use radicle::node::{AliasStore, Handle, NodeId};
use radicle::Node;

use crate::api::error::Error;
use crate::api::{Context, RADICLE_VERSION};
use crate::axum_extra::Path;

pub fn router(ctx: Context) -> Router {
    Router::new()
        .route("/node", get(node_handler))
        .route("/node/policies/repos", get(node_policies_repos_handler))
        .route("/nodes/:nid", get(nodes_handler))
        .route("/nodes/:nid/inventory", get(nodes_inventory_handler))
        .with_state(ctx)
}

/// Return local node information.
/// `GET /node`
async fn node_handler(State(ctx): State<Context>) -> impl IntoResponse {
    let node = Node::new(ctx.profile.socket());
    let node_id = ctx.profile.public_key;
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
        "version": format!("{}-{}", RADICLE_VERSION, env!("GIT_HEAD")),
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
    let resources = db.get_resources(&nid)?;

    Ok::<_, Error>(Json(resources))
}

/// Return local repo policies information.
/// `GET /node/policies/repos`
async fn node_policies_repos_handler(State(ctx): State<Context>) -> impl IntoResponse {
    let policies = ctx.profile.policies()?;
    let mut repos = Vec::new();

    for SeedPolicy { rid: id, policy } in policies.seed_policies()? {
        repos.push(json!({
            "id": id,
            "scope": policy.scope().unwrap_or_default(),
            "policy": Policy::from(policy),
        }));
    }

    Ok::<_, Error>(Json(repos))
}
