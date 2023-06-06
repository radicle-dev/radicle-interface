<script lang="ts">
  import type { IssueStatus } from "./Issues.svelte";
  import type { PatchStatus } from "./Patches.svelte";
  import type { ProjectRoute } from "@app/views/projects/router";
  import type { Tree, Project } from "@httpd-client";

  import * as router from "@app/lib/router";
  import * as utils from "@app/lib/utils";
  import { HttpdClient } from "@httpd-client";
  import { formatNodeId, unreachable } from "@app/lib/utils";
  import { httpdStore } from "@app/lib/httpd";
  import { updateProjectRoute } from "@app/views/projects/router";

  import Loading from "@app/components/Loading.svelte";
  import ErrorMessage from "@app/components/ErrorMessage.svelte";
  import NotFound from "@app/components/NotFound.svelte";
  import Placeholder from "@app/components/Placeholder.svelte";
  import SourceBrowsingHeader from "./SourceBrowsingHeader.svelte";

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
  export let project: Project;

  $: id = activeRoute.params.id;
  $: peer = activeRoute.params.peer;
  $: revision = activeRoute.params.revision;

  $: searchParams = new URLSearchParams(activeRoute.params.search || "");
  $: issueFilter = (searchParams.get("state") as IssueStatus) || "open";
  $: patchTabFilter =
    (searchParams.get("tab") as "activity" | "commits" | "files") || "activity";
  $: patchFilter = (searchParams.get("state") as PatchStatus) || "open";
  $: patchDiffFilter = searchParams.get("diff") || undefined;
  $: baseUrl = utils.extractBaseUrl(activeRoute.params.hostnamePort);
  $: api = new HttpdClient(baseUrl);

  // Parses the path consisting of a revision (eg. branch or commit) and file
  // path into a tuple [revision, file-path]
  function parseRoute(
    input: string,
    branches: Record<string, string>,
  ): { path?: string; revision?: string } {
    const parsed: { path?: string; revision?: string } = {};
    const commitPath = [input.slice(0, 40), input.slice(41)];
    const branch = Object.entries(branches).find(([branchName]) =>
      input.startsWith(branchName),
    );

    if (branch) {
      const [rev, path] = [
        input.slice(0, branch[0].length),
        input.slice(branch[0].length + 1),
      ];
      parsed.revision = rev;
      parsed.path = path || "/";
    } else if (router.isOid(commitPath[0])) {
      parsed.revision = commitPath[0];
      parsed.path = commitPath[1] || "/";
    } else {
      parsed.path = input;
    }
    return parsed;
  }

  const getProject = async (id: string, peer?: string) => {
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
      void updateProjectRoute(
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

    return { branches, peers };
  };

  async function getRoot(
    branches: Record<string, string>,
    defaultBranch: string,
    revision?: string,
  ): Promise<{ tree: Tree }> {
    const commit = router.parseRevisionToOid(revision, defaultBranch, branches);
    const tree = await api.project.getTree(id, commit);

    return { tree };
  }

  function handleIssueCreation({ detail: issueId }: CustomEvent<string>) {
    void router.push({
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
</script>

<style>
  .header {
    width: 100%;
    max-width: var(--content-max-width);
    min-width: var(--content-min-width);
    padding-top: 4rem;
  }
  main {
    width: 100%;
    max-width: var(--content-max-width);
    min-width: var(--content-min-width);
    padding-bottom: 4rem;
  }
  main > .message {
    padding: 0 2rem 0 8rem;
  }

  @media (max-width: 960px) {
    main > .message {
      padding-left: 2rem;
    }
    main {
      padding-top: 2rem;
      min-width: 0;
    }
  }
</style>

<div class="header">
  <ProjectMeta
    projectId={project.id}
    projectName={project.name}
    projectDescription={project.description}
    nodeId={peer} />
  <Header
    projectId={project.id}
    projectName={project.name}
    openPatchCount={project.patches.open}
    openIssueCount={project.issues.open}
    {activeRoute}
    {baseUrl} />
</div>

{#await projectPromise then { peers, branches }}
  {@const commit = router.parseRevisionToOid(
    revision,
    project.defaultBranch,
    branches,
  )}
  <main>
    {#await getRoot(branches, project.defaultBranch, revision)}
      <Loading center />
    {:then { tree }}
      {#if activeRoute.params.view.resource === "tree" || activeRoute.params.view.resource === "history" || activeRoute.params.view.resource === "commits"}
        <SourceBrowsingHeader
          {project}
          {activeRoute}
          {peers}
          {branches}
          commitCount={tree.stats.commits}
          contributorCount={tree.stats.contributors}
          revision={activeRoute.params.revision} />
      {/if}

      {#if activeRoute.params.view.resource === "tree"}
        <Browser
          {baseUrl}
          {project}
          {revision}
          {branches}
          {tree}
          {activeRoute} />
      {:else if activeRoute.params.view.resource === "history"}
        <History projectId={project.id} {baseUrl} parentCommit={commit} />
      {:else if activeRoute.params.view.resource === "commits"}
        {#await api.project.getCommitBySha(id, commit)}
          <Loading center />
        {:then fetchedCommit}
          <Commit commit={fetchedCommit} />
        {:catch e}
          <div class="message">
            <ErrorMessage message="Couln't load commit." stackTrace={e} />
          </div>
        {/await}
      {:else if activeRoute.params.view.resource === "issues" && activeRoute.params.view.params?.view.resource === "new"}
        {#if $httpdStore.state === "authenticated"}
          <NewIssue
            on:create={handleIssueCreation}
            session={$httpdStore.session}
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
          {@const latestRevision = patch.revisions[patch.revisions.length - 1]}
          <Patch
            {patch}
            {baseUrl}
            projectId={project.id}
            projectDefaultBranch={project.defaultBranch}
            projectHead={project.head}
            revision={activeRoute.params.view.params.revision ??
              latestRevision.id}
            currentTab={patchTabFilter}
            diff={patchDiffFilter} />
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
    <NotFound subtitle={id} title="Project not found" />
  </div>
{/await}
