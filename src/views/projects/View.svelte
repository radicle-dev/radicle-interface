<script lang="ts">
  import type { IssueStatus } from "./Issues.svelte";
  import type { PatchStatus } from "./Patches.svelte";
  import type { ProjectLoadedRoute } from "@app/views/projects/router";

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

  export let activeRoute: ProjectLoadedRoute;

  $: searchParams = new URLSearchParams(activeRoute.params.search || "");
  $: issueFilter = (searchParams.get("state") as IssueStatus) || "open";
  $: patchTabFilter =
    (searchParams.get("tab") as "activity" | "commits" | "files") || "activity";
  $: patchFilter = (searchParams.get("state") as PatchStatus) || "open";
  $: patchDiffFilter = searchParams.get("diff") || undefined;
  $: baseUrl = utils.extractBaseUrl(activeRoute.params.hostnamePort);
  $: api = new HttpdClient(baseUrl);

  function handleIssueCreation({ detail: issueId }: CustomEvent<string>) {
    void router.push({
      resource: "projects",
      params: {
        id: activeRoute.params.project.id,
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
    projectId={activeRoute.params.project.id}
    projectName={activeRoute.params.project.name}
    projectDescription={activeRoute.params.project.description}
    nodeId={activeRoute.params.peer} />
  <Header
    projectId={activeRoute.params.project.id}
    projectName={activeRoute.params.project.name}
    openPatchCount={activeRoute.params.project.patches.open}
    openIssueCount={activeRoute.params.project.issues.open}
    {activeRoute}
    {baseUrl} />
</div>

<main>
  {#if activeRoute.params.view.resource === "tree" || activeRoute.params.view.resource === "history" || activeRoute.params.view.resource === "commits"}
    <SourceBrowsingHeader
      project={activeRoute.params.project}
      {activeRoute}
      peers={activeRoute.params.view.params.loadedPeers}
      branches={activeRoute.params.view.params.loadedBranches}
      commitCount={activeRoute.params.view.params.loadedTree.stats.commits}
      contributorCount={activeRoute.params.view.params.loadedTree.stats
        .contributors}
      revision={activeRoute.params.revision} />

    {#if activeRoute.params.view.resource === "tree"}
      <Browser
        {baseUrl}
        project={activeRoute.params.project}
        revision={activeRoute.params.revision}
        branches={activeRoute.params.view.params.loadedBranches}
        tree={activeRoute.params.view.params.loadedTree}
        {activeRoute} />
    {:else if activeRoute.params.view.resource === "history"}
      <History
        projectId={activeRoute.params.project.id}
        {baseUrl}
        parentCommit={activeRoute.params.view.params.selectedCommit} />
    {:else if activeRoute.params.view.resource === "commits"}
      {#await api.project.getCommitBySha(activeRoute.params.project.id, activeRoute.params.view.params.selectedCommit)}
        <Loading center />
      {:then fetchedCommit}
        <Commit commit={fetchedCommit} />
      {:catch e}
        <div class="message">
          <ErrorMessage message="Couln't load commit." stackTrace={e} />
        </div>
      {/await}
    {/if}
  {:else if activeRoute.params.view.resource === "issues" && activeRoute.params.view.params?.view.resource === "new"}
    {#if $httpdStore.state === "authenticated"}
      <NewIssue
        on:create={handleIssueCreation}
        session={$httpdStore.session}
        projectId={activeRoute.params.project.id}
        projectHead={activeRoute.params.project.head}
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
      projectId={activeRoute.params.project.id}
      issueCounters={activeRoute.params.project.issues}
      state={issueFilter} />
  {:else if activeRoute.params.view.resource === "issue"}
    {#await api.project.getIssueById(activeRoute.params.project.id, activeRoute.params.view.params.issue)}
      <Loading center />
    {:then issue}
      <Issue
        on:update={handleIssueUpdate}
        projectId={activeRoute.params.project.id}
        projectHead={activeRoute.params.project.head}
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
      projectId={activeRoute.params.project.id}
      state={patchFilter}
      patchCounters={activeRoute.params.project.patches} />
  {:else if activeRoute.params.view.resource === "patch"}
    {#await api.project.getPatchById(activeRoute.params.project.id, activeRoute.params.view.params.patch)}
      <Loading center />
    {:then patch}
      {@const latestRevision = patch.revisions[patch.revisions.length - 1]}
      <Patch
        {patch}
        {baseUrl}
        projectId={activeRoute.params.project.id}
        projectDefaultBranch={activeRoute.params.project.defaultBranch}
        projectHead={activeRoute.params.project.head}
        revision={activeRoute.params.view.params.revision ?? latestRevision.id}
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
</main>
