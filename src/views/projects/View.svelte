<script lang="ts">
  import type { ProjectRoute } from "@app/lib/router/definitions";
  import type { State as IssueState } from "./Issues.svelte";

  import * as issue from "@app/lib/issue";
  import * as proj from "@app/lib/project";
  import * as router from "@app/lib/router";
  import Loading from "@app/components/Loading.svelte";
  import NotFound from "@app/components/NotFound.svelte";
  import { formatNodeId, unreachable } from "@app/lib/utils";
  import { sessionStore } from "@app/lib/session";

  import Browser from "./Browser.svelte";
  import Commit from "./Commit.svelte";
  import Header from "./Header.svelte";
  import History from "./History.svelte";
  import Issue from "./Issue.svelte";
  import Issues from "./Issues.svelte";
  import Message from "@app/components/Message.svelte";
  import NewIssue from "./Issue/New.svelte";
  import Placeholder from "@app/components/Placeholder.svelte";
  import ProjectMeta from "./ProjectMeta.svelte";

  export let activeRoute: ProjectRoute;

  $: id = activeRoute.params.id;
  $: peer = activeRoute.params.peer;
  $: seed = activeRoute.params.seed;

  $: searchParams = new URLSearchParams(activeRoute.params.search || "");
  $: issueFilter = (searchParams.get("state") as IssueState) || "open";

  const getProject = async (id: string, seed: string, peer?: string) => {
    const project = await proj.Project.get(id, seed, peer);
    if (activeRoute.params.route) {
      const { revision, path } = proj.parseRoute(
        activeRoute.params.route,
        project.branches,
      );
      router.updateProjectRoute(
        {
          revision,
          path,
          line: activeRoute.params.line,
          hash: activeRoute.params.hash,
          route: undefined,
        },
        { replace: true },
      );
    }
    if (!activeRoute.params.revision) {
      // We need a revision to fetch `getRoot`.
      // Don't use router.updateProjectRoute, to avoid changing the URL.
      activeRoute.params.revision = project.defaultBranch;
    }

    return project;
  };

  const handleIssueCreation = () => {
    router.push({
      resource: "projects",
      params: {
        id,
        seed,
        view: {
          resource: "issues",
        },
      },
    });
    // This assignment allows us to have an up-to-date issue count
    projectPromise = getProject(id, seed, peer);
  };

  // React to peer changes
  $: projectPromise = getProject(id, seed, peer);

  // Content can be altered in child components.
  $: revision = activeRoute.params.revision || null;
</script>

<style>
  main {
    width: 100%;
    max-width: var(--content-max-width);
    min-width: var(--content-min-width);
    padding: 4rem 0;
  }
  main > header {
    padding: 0 2rem 0 8rem;
  }
  main > .message {
    padding: 0 2rem 0 8rem;
  }

  @media (max-width: 960px) {
    main > header {
      padding-left: 2rem;
    }
    main > .message {
      padding-left: 2rem;
    }
    main {
      padding-top: 2rem;
      min-width: 0;
    }
  }
</style>

{#await projectPromise}
  <main>
    <header>
      <Loading center />
    </header>
  </main>
{:then project}
  <main>
    <ProjectMeta {project} nodeId={peer} />
    {#await project.getRoot(revision)}
      <Loading center />
    {:then { tree, commit }}
      <Header {tree} {commit} {project} {activeRoute} />

      {#if activeRoute.params.view.resource === "tree"}
        <Browser {project} {commit} {tree} {activeRoute} />
      {:else if activeRoute.params.view.resource === "history"}
        {#await proj.Project.getCommits( project.id, project.seed.addr, { parent: commit, verified: true }, )}
          <Loading center />
        {:then history}
          <History {project} {history} />
        {:catch e}
          <div class="message">
            <Message error>{e.message}</Message>
          </div>
        {/await}
      {:else if activeRoute.params.view.resource === "commits"}
        {#await project.getCommit(commit)}
          <Loading center />
        {:then commit}
          <Commit {commit} />
        {:catch e}
          <div class="message">
            <Message error>{e.message}</Message>
          </div>
        {/await}
      {:else if activeRoute.params.view.resource === "issues" && activeRoute.params.view.params?.view.resource === "new"}
        {#if $sessionStore}
          <NewIssue
            on:create={handleIssueCreation}
            session={$sessionStore}
            {project} />
        {:else}
          <div class="message">
            <Message error>
              Could not access the issue creation. Make sure you're still logged
              in.
            </Message>
          </div>
        {/if}
      {:else if activeRoute.params.view.resource === "issues"}
        {#await issue.Issue.getIssues(project.id, project.seed.addr)}
          <Loading center />
        {:then issues}
          <Issues {project} state={issueFilter} {issues} />
        {:catch e}
          <div class="message">
            <Message error>{e.message}</Message>
          </div>
        {/await}
      {:else if activeRoute.params.view.resource === "issue"}
        {#await issue.Issue.getIssue(project.id, activeRoute.params.view.params.issue, project.seed.addr)}
          <Loading center />
        {:then issue}
          <Issue {project} {issue} />
        {:catch e}
          <div class="message">
            <Message error>{e.message}</Message>
          </div>
        {/await}
      {:else}
        {unreachable(activeRoute.params.view)}
      {/if}
    {:catch e}
      <div class="message">
        {#if peer}
          <Placeholder emoji="🍂">
            <span slot="title">
              <span class="txt-monospace">{formatNodeId(peer)}</span>
            </span>
            <span slot="body">
              <span style="display: block">
                Couldn't load remote source tree.
              </span>
              <span>{e.message}</span>
            </span>
          </Placeholder>
        {:else}
          <Placeholder emoji="🍂">
            <span slot="body">
              <span style="display: block">Couldn't load source tree.</span>
              <span>{e.message}</span>
            </span>
          </Placeholder>
        {/if}
      </div>
    {/await}
  </main>
{:catch}
  <div class="layout-centered">
    <NotFound subtitle={id} title="This project was not found" />
  </div>
{/await}
