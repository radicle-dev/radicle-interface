<script lang="ts">
  import type { IssueStatus } from "./Issues.svelte";
  import type { PatchStatus } from "./Patches.svelte";
  import type { ProjectRoute } from "@app/lib/router/definitions";
  import type { Tree } from "@httpd-client";

  import * as router from "@app/lib/router";
  import * as utils from "@app/lib/utils";
  import { HttpdClient } from "@httpd-client";
  import { formatNodeId, unreachable } from "@app/lib/utils";
  import { sessionStore } from "@app/lib/session";

  import Loading from "@app/components/Loading.svelte";
  import ErrorMessage from "@app/components/ErrorMessage.svelte";
  import NotFound from "@app/components/NotFound.svelte";
  import Placeholder from "@app/components/Placeholder.svelte";

  import Browser from "./Browser.svelte";
  import Commit from "./Commit.svelte";
  import Header from "./Header.svelte";
  import History from "./History.svelte";
  import Issue from "./Issue.svelte";
  import Issues from "./Issues.svelte";
  import NewIssue from "./Issue/New.svelte";
  import Patch from "./Patch.svelte";
  import Patches from "./Patches.svelte";
  import ProjectMeta from "./ProjectMeta.svelte";

  export let activeRoute: ProjectRoute;

  $: id = activeRoute.params.id;
  $: peer = activeRoute.params.peer;

  $: searchParams = new URLSearchParams(activeRoute.params.search || "");
  $: issueFilter = (searchParams.get("state") as IssueStatus) || "open";
  $: patchTabFilter =
    (searchParams.get("tab") as "activity" | "commits") || "activity";
  $: patchFilter = (searchParams.get("state") as PatchStatus) || "open";
  $: baseUrl = utils.extractBaseUrl(activeRoute.params.hostnamePort);
  $: api = new HttpdClient(baseUrl);

  // Parses the path consisting of a revision (eg. branch or commit) and file
  // path into a tuple [revision, file-path]
  function parseRoute(
    input: string,
    branches: Record<string, string>,
  ): { path?: string; revision?: string } {
    const branch = Object.entries(branches).find(([branchName]) =>
      input.startsWith(branchName),
    );
    const commitPath = [input.slice(0, 40), input.slice(41)];
    const parsed: { path?: string; revision?: string } = {};

    if (branch) {
      const [rev, path] = [
        input.slice(0, branch[0].length),
        input.slice(branch[0].length + 1),
      ];

      parsed.revision = rev;
      parsed.path = path ? path : "/";
    } else if (utils.isOid(commitPath[0])) {
      parsed.revision = commitPath[0];
      parsed.path = commitPath[1] ? commitPath[1] : "/";
    } else {
      parsed.path = input;
    }
    return parsed;
  }

  const getProject = async (id: string, peer?: string) => {
    const project = await api.project.getById(id);
    const peers = await api.project.getAllRemotes(id);
    let branches = project.head
      ? { [project.defaultBranch]: project.head }
      : {};
    if (peer) {
      try {
        branches = (await api.project.getRemoteByPeer(id, peer)).heads;
      } catch {
        branches = {};
      }
    }

    if (activeRoute.params.route) {
      const { revision, path } = parseRoute(activeRoute.params.route, branches);
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

    return { project, branches, peers };
  };

  async function getRoot(
    revision: string | null,
    branches: Record<string, string>,
    head: string,
  ): Promise<{ tree: Tree; commit: string }> {
    const commit = revision ? utils.getOid(revision, branches) : head;

    if (!commit) {
      throw new Error(`Revision ${revision} not found`);
    }
    const tree = await api.project.getTree(id, commit);

    return { tree, commit };
  }

  function handleIssueCreation({ detail: issueId }: CustomEvent<string>) {
    router.push({
      resource: "projects",
      params: {
        id,
        hostnamePort: baseUrl.hostname,
        view: {
          resource: "issue",
          params: { issue: issueId },
        },
      },
    });
    // This assignment allows us to have an up-to-date issue count
    projectPromise = getProject(id, peer);
  }

  function handleIssueUpdate() {
    projectPromise = getProject(id, peer);
  }

  // React to peer changes
  $: projectPromise = getProject(id, peer);

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
{:then { project, peers, branches }}
  <main>
    <ProjectMeta {project} nodeId={peer} />
    {#await getRoot(revision, branches, project.head)}
      <Loading center />
    {:then { tree, commit }}
      <Header
        {tree}
        {commit}
        {project}
        {branches}
        {peers}
        {activeRoute}
        {baseUrl} />

      {#if activeRoute.params.view.resource === "tree"}
        <Browser {baseUrl} {project} {commit} {tree} {activeRoute} />
      {:else if activeRoute.params.view.resource === "history"}
        {#await api.project.getAllCommits(project.id, { parent: commit })}
          <Loading center />
        {:then history}
          <History
            id={project.id}
            {baseUrl}
            history={history.commits.map(c => c.commit)} />
        {:catch e}
          <div class="message">
            <ErrorMessage message="Couldn't load commits." stackTrace={e} />
          </div>
        {/await}
      {:else if activeRoute.params.view.resource === "commits"}
        {#await api.project.getCommitBySha(id, commit)}
          <Loading center />
        {:then commit}
          <Commit {commit} />
        {:catch e}
          <div class="message">
            <ErrorMessage message="Couln't load commit." stackTrace={e} />
          </div>
        {/await}
      {:else if activeRoute.params.view.resource === "issues" && activeRoute.params.view.params?.view.resource === "new"}
        {#if $sessionStore}
          <NewIssue
            on:create={handleIssueCreation}
            session={$sessionStore}
            projectId={project.id}
            projectHead={project.head}
            {baseUrl} />
        {:else}
          <div class="message">
            <ErrorMessage
              message="Couldn't access issue creation. Make sure you're still logged in." />
          </div>
        {/if}
      {:else if activeRoute.params.view.resource === "issues"}
        <Issues
          {baseUrl}
          projectId={project.id}
          issueCounters={project.issues}
          state={issueFilter} />
      {:else if activeRoute.params.view.resource === "issue"}
        {#await api.project.getIssueById(project.id, activeRoute.params.view.params.issue)}
          <Loading center />
        {:then issue}
          <Issue
            on:update={handleIssueUpdate}
            projectId={project.id}
            projectHead={project.head}
            {baseUrl}
            {issue} />
        {:catch e}
          <div class="message">
            <ErrorMessage message="Couldn't load issue." stackTrace={e} />
          </div>
        {/await}
      {:else if activeRoute.params.view.resource === "patches"}
        <Patches
          {baseUrl}
          projectId={project.id}
          state={patchFilter}
          patchCounters={project.patches} />
      {:else if activeRoute.params.view.resource === "patch"}
        {#await api.project.getPatchById(project.id, activeRoute.params.view.params.patch)}
          <Loading center />
        {:then patch}
          <Patch
            {baseUrl}
            projectId={project.id}
            projectHead={project.head}
            revision={activeRoute.params.view.params.revision}
            currentTab={patchTabFilter}
            {patch} />
        {:catch e}
          <div class="message">
            <ErrorMessage message="Couldn't load patch." stackTrace={e} />
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
