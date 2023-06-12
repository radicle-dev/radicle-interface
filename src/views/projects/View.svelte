<script lang="ts">
  import type { IssueStatus } from "./Issues.svelte";
  import type { PatchStatus } from "./Patches.svelte";
  import type { Project } from "@httpd-client";
  import type { ProjectLoadedView } from "@app/views/projects/router";

  import * as router from "@app/lib/router";
  import * as utils from "@app/lib/utils";
  import { HttpdClient } from "@httpd-client";
  import { unreachable } from "@app/lib/utils";
  import { httpdStore } from "@app/lib/httpd";

  import Loading from "@app/components/Loading.svelte";
  import ErrorMessage from "@app/components/ErrorMessage.svelte";
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

  export let hostnamePort: string;
  export let id: string;
  export let project: Project;
  export let view: ProjectLoadedView;

  export let hash: string | undefined = undefined;
  export let path: string | undefined = undefined;
  export let peer: string | undefined = undefined;
  export let revision: string | undefined = undefined;
  export let search: string | undefined = undefined;

  $: searchParams = new URLSearchParams(search || "");
  $: issueFilter = (searchParams.get("state") as IssueStatus) || "open";
  $: patchTabFilter =
    (searchParams.get("tab") as "activity" | "commits" | "files") || "activity";
  $: patchFilter = (searchParams.get("state") as PatchStatus) || "open";
  $: patchDiffFilter = searchParams.get("diff") || undefined;
  $: baseUrl = utils.extractBaseUrl(hostnamePort);
  $: api = new HttpdClient(baseUrl);

  function handleIssueCreation({ detail: issueId }: CustomEvent<string>) {
    void router.push({
      resource: "projects",
      params: {
        id: id,
        hostnamePort: baseUrl.hostname,
        view: {
          resource: "issue",
          params: { issue: issueId },
        },
      },
    });
  }

  function handleIssueUpdate() {
    // FIXME
  }
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
    projectId={id}
    projectName={project.name}
    projectDescription={project.description}
    nodeId={peer} />
  <Header
    projectId={id}
    projectName={project.name}
    openPatchCount={project.patches.open}
    openIssueCount={project.issues.open}
    {view}
    {baseUrl} />
</div>

<main>
  {#if view.resource === "tree" || view.resource === "history" || view.resource === "commits"}
    <SourceBrowsingHeader
      {project}
      {peer}
      {view}
      peers={view.params.loadedPeers}
      branches={view.params.loadedBranches}
      commitCount={view.params.loadedTree.stats.commits}
      contributorCount={view.params.loadedTree.stats.contributors}
      {revision} />

    {#if view.resource === "tree"}
      <Browser
        {baseUrl}
        {project}
        {revision}
        branches={view.params.loadedBranches}
        tree={view.params.loadedTree}
        path={path || "/"}
        {hash} />
    {:else if view.resource === "history"}
      <History
        projectId={id}
        {baseUrl}
        parentCommit={view.params.selectedCommit} />
    {:else if view.resource === "commits"}
      {#await api.project.getCommitBySha(id, view.params.selectedCommit)}
        <Loading center />
      {:then fetchedCommit}
        <Commit commit={fetchedCommit} />
      {:catch e}
        <div class="message">
          <ErrorMessage message="Couln't load commit." stackTrace={e} />
        </div>
      {/await}
    {/if}
  {:else if view.resource === "issues" && view.params?.view.resource === "new"}
    {#if $httpdStore.state === "authenticated"}
      <NewIssue
        on:create={handleIssueCreation}
        session={$httpdStore.session}
        projectId={id}
        projectHead={project.head}
        {baseUrl} />
    {:else}
      <div class="message">
        <ErrorMessage
          message="Couldn't access issue creation. Make sure you're still logged in." />
      </div>
    {/if}
  {:else if view.resource === "issues"}
    <Issues
      {baseUrl}
      projectId={id}
      issueCounters={project.issues}
      state={issueFilter} />
  {:else if view.resource === "issue"}
    {#await api.project.getIssueById(id, view.params.issue)}
      <Loading center />
    {:then issue}
      <Issue
        on:update={handleIssueUpdate}
        projectId={id}
        projectHead={project.head}
        {baseUrl}
        {issue} />
    {:catch e}
      <div class="message">
        <ErrorMessage message="Couldn't load issue." stackTrace={e} />
      </div>
    {/await}
  {:else if view.resource === "patches"}
    <Patches
      {baseUrl}
      projectId={id}
      state={patchFilter}
      patchCounters={project.patches} />
  {:else if view.resource === "patch"}
    {#await api.project.getPatchById(id, view.params.patch)}
      <Loading center />
    {:then patch}
      {@const latestRevision = patch.revisions[patch.revisions.length - 1]}
      <Patch
        {patch}
        {baseUrl}
        projectId={id}
        projectDefaultBranch={project.defaultBranch}
        projectHead={project.head}
        revision={view.params.revision ?? latestRevision.id}
        currentTab={patchTabFilter}
        diff={patchDiffFilter} />
    {:catch e}
      <div class="message">
        <ErrorMessage message="Couldn't load patch." stackTrace={e} />
      </div>
    {/await}
  {:else}
    {unreachable(view)}
  {/if}
</main>
