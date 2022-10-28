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

  export let wallet: Wallet;
  export let activeRoute: ProjectRoute;

  $: urn = activeRoute.params.urn;
  $: seed = activeRoute.params.seed ?? null;
  $: profile = activeRoute.params.profile ?? null;
  $: peer = activeRoute.params.peer ?? null;

  $: searchParams = new URLSearchParams(activeRoute.params.search || "");
  $: issueFilter = (searchParams.get("state") as IssueState) || "open";
  $: patchFilter = (searchParams.get("state") as PatchState) || "proposed";

  // Passing peer as param to allow to react to peer change.
  const getProject = async (peer: string | null) => {
    const project = await proj.Project.get(urn, peer, profile, seed, wallet);
    if (activeRoute.params.route) {
      const { revision, path } = proj.parseRoute(
        activeRoute.params.route,
        project.branches,
      );
      // Updating revision and patch with resolved route and nulling the route param.
      const params: ProjectRoute = {
        type: "projects",
        params: {
          ...activeRoute.params,
          revision,
          path,
          route: null,
        },
      };
      router.activeRouteStore.set(params);
    }

    return project;
  };

  // Content can be altered in child components.
  $: revision = activeRoute.params.revision || null;
  $: content = activeRoute.params.content || "tree";

  $: console.log(activeRoute.params.activeView);
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
  .message {
    padding: 0 2rem 0 8rem;
  }

  @media (max-width: 960px) {
    main > header {
      padding-left: 2rem;
    }
    main {
      padding-top: 2rem;
      min-width: 0;
    }
  }
</style>

<main>
  {#await getProject(peer)}
    <header>
      <Loading center />
    </header>
  {:then project}
    <ProjectMeta {project} {peer} />

    {#await project.getRoot(revision)}
      <Loading center />
    {:then { tree, commit }}
      <Header {tree} {commit} {project} />

      {#if content === "tree"}
        <Browser {project} {commit} {tree} />
      {:else if content === "commits"}
        {#await proj.Project.getCommits( project.urn, project.seed.api, { parent: commit, verified: true }, )}
          <Loading center />
        {:then history}
          <History {project} {history} />
        {:catch e}
          <div class="message">
            <Message error>{e.message}</Message>
          </div>
        {/await}
      {:else if content === "commit"}
        {#await project.getCommit(commit)}
          <Loading center />
        {:then commit}
          <Commit {project} {commit} />
        {:catch e}
          <div class="message">
            <Message error>{e.message}</Message>
          </div>
        {/await}
      {:else if content === "issues"}
        {#await issue.Issue.getIssues(project.urn, project.seed.api)}
          <Loading center />
        {:then issues}
          <Issues {project} state={issueFilter} {wallet} {issues} />
        {:catch e}
          <div class="message">
            <Message error>{e.message}</Message>
          </div>
        {/await}
      {:else if content === "issue" && activeRoute.params.issue}
        {#await issue.Issue.getIssue(project.urn, activeRoute.params.issue, project.seed.api)}
          <Loading center />
        {:then issue}
          <Issue {project} {wallet} {issue} />
        {:catch e}
          <div class="message">
            <Message error>{e.message}</Message>
          </div>
        {/await}
      {:else if content === "patches"}
        {#await patch.Patch.getPatches(project.urn, project.seed.api)}
          <Loading center />
        {:then patches}
          <Patches {project} {wallet} state={patchFilter} {patches} />
        {:catch e}
          <div class="message">
            <Message error>{e.message}</Message>
          </div>
        {/await}
      {:else if content === "patch" && activeRoute.params.patch}
        {#await patch.Patch.getPatch(project.urn, activeRoute.params.patch, project.seed.api)}
          <Loading center />
        {:then patch}
          <Patch {project} {wallet} {patch} />
        {:catch e}
          <div class="message">
            <Message error>{e.message}</Message>
          </div>
        {/await}
      {/if}
    {/await}
  {:catch}
    <NotFound title={urn} subtitle="This project was not found." />
  {/await}
</main>
