<script lang="ts">
  import type { Wallet } from "@app/wallet";
  import type { ProjectRoute } from "@app/router/definitions";
  import type { State as IssueState } from "./Issues.svelte";
  import type { State as PatchState } from "./Patches.svelte";

  import * as issue from "@app/issue";
  import * as patch from "@app/patch";
  import * as proj from "@app/project";
  import * as router from "@app/router";
  import Loading from "@app/Loading.svelte";
  import NotFound from "@app/NotFound.svelte";
  import { formatSeedId, unreachable } from "@app/utils";

  import Header from "./Header.svelte";
  import Browser from "./Browser.svelte";
  import History from "./History.svelte";
  import Commit from "./Commit.svelte";
  import Issues from "./Issues.svelte";
  import Issue from "./Issue.svelte";
  import Patches from "./Patches.svelte";
  import Patch from "./Patch.svelte";
  import ProjectMeta from "./ProjectMeta.svelte";
  import Message from "@app/Message.svelte";
  import Placeholder from "@app/Placeholder.svelte";

  export let wallet: Wallet;
  export let activeRoute: ProjectRoute;

  $: urn = activeRoute.params.urn;
  $: peer = activeRoute.params.peer ?? null;
  $: seed = activeRoute.params.seed ?? null;
  $: profile = activeRoute.params.profile ?? null;

  $: searchParams = new URLSearchParams(activeRoute.params.search || "");
  $: issueFilter = (searchParams.get("state") as IssueState) || "open";
  $: patchFilter = (searchParams.get("state") as PatchState) || "proposed";

  const getProject = async (
    urn: string,
    peer: string | null,
    profile: string | null,
    seed: string | null,
  ) => {
    const project = await proj.Project.get(urn, peer, profile, seed, wallet);
    if (activeRoute.params.route) {
      const { revision, path } = proj.parseRoute(
        activeRoute.params.route,
        project.branches,
      );
      router.updateProjectRoute({
        revision,
        path,
        line: activeRoute.params.line,
        hash: activeRoute.params.hash,
        route: undefined,
      });
    }
    if (!activeRoute.params.revision) {
      // We need a revision to fetch `getRoot`.
      // Don't use router.updateProjectRoute, to avoid changing the URL.
      activeRoute.params.revision = project.defaultBranch;
    }

    return project;
  };

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

<main>
  {#await getProject(urn, peer, profile, seed)}
    <header>
      <Loading center />
    </header>
  {:then project}
    <ProjectMeta {project} {peer} />
    {#await project.getRoot(revision)}
      <Loading center />
    {:then { tree, commit }}
      <Header {tree} {commit} {project} {activeRoute} />

      {#if activeRoute.params.view.resource === "tree"}
        <Browser {project} {commit} {tree} {activeRoute} />
      {:else if activeRoute.params.view.resource === "history"}
        {#await proj.Project.getCommits( project.urn, project.seed.api, { parent: commit, verified: true }, )}
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
      {:else if activeRoute.params.view.resource === "issues"}
        {#await issue.Issue.getIssues(project.urn, project.seed.api)}
          <Loading center />
        {:then issues}
          <Issues state={issueFilter} {wallet} {issues} />
        {:catch e}
          <div class="message">
            <Message error>{e.message}</Message>
          </div>
        {/await}
      {:else if activeRoute.params.view.resource === "issue"}
        {#await issue.Issue.getIssue(project.urn, activeRoute.params.view.params.issue, project.seed.api)}
          <Loading center />
        {:then issue}
          <Issue {project} {wallet} {issue} />
        {:catch e}
          <div class="message">
            <Message error>{e.message}</Message>
          </div>
        {/await}
      {:else if activeRoute.params.view.resource === "patches"}
        {#await patch.Patch.getPatches(project.urn, project.seed.api)}
          <Loading center />
        {:then patches}
          <Patches {wallet} state={patchFilter} {patches} />
        {:catch e}
          <div class="message">
            <Message error>{e.message}</Message>
          </div>
        {/await}
      {:else if activeRoute.params.view.resource === "patch"}
        {#await patch.Patch.getPatch(project.urn, activeRoute.params.view.params.patch, project.seed.api)}
          <Loading center />
        {:then patch}
          <Patch {project} {wallet} {patch} />
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
              <span class="txt-monospace">{formatSeedId(peer)}</span>
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
  {:catch}
    <NotFound title={urn} subtitle="This project was not found." />
  {/await}
</main>
