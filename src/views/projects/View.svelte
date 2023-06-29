<script lang="ts">
  import type { BaseUrl, Project } from "@httpd-client";
  import type { ProjectLoadedView } from "@app/views/projects/router";

  import { unreachable } from "@app/lib/utils";

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

  export let id: string;
  export let project: Project;
  export let view: ProjectLoadedView;
  export let baseUrl: BaseUrl;

  export let hash: string | undefined = undefined;
  export let peer: string | undefined = undefined;
  export let revision: string | undefined = undefined;
  export let search: string | undefined = undefined;
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
    trackings={project.trackings}
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
        commit={view.params.selectedCommit}
        tree={view.params.loadedTree}
        blobResult={view.blobResult}
        path={view.path}
        {hash} />
    {:else if view.resource === "history"}
      <History
        projectId={id}
        {baseUrl}
        totalCommitCount={view.totalCommitCount}
        commitHeaders={view.commitHeaders} />
    {:else if view.resource === "commits"}
      <Commit commit={view.commit} />
    {/if}
  {:else if view.resource === "issues"}
    {#if view.params.view.resource === "new"}
      <NewIssue projectId={id} projectHead={project.head} {baseUrl} />
    {:else if view.params.view.resource === "list"}
      <Issues
        {baseUrl}
        projectId={id}
        issueCounters={project.issues}
        {search} />
    {:else}
      {unreachable(view.params.view.resource)}
    {/if}
  {:else if view.resource === "issue"}
    <Issue
      projectId={id}
      projectHead={project.head}
      {baseUrl}
      issue={view.params.loadedIssue} />
  {:else if view.resource === "patches"}
    <Patches
      {baseUrl}
      projectId={id}
      patchCounters={project.patches}
      {search} />
  {:else if view.resource === "patch"}
    <Patch
      patch={view.params.loadedPatch}
      {baseUrl}
      projectId={id}
      projectDefaultBranch={project.defaultBranch}
      projectHead={project.head}
      revision={view.params.revision}
      {search} />
  {:else}
    {unreachable(view)}
  {/if}
</main>
