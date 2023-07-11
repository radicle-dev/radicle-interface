<script lang="ts">
  import type { BaseUrl, Project } from "@httpd-client";
  import type { ProjectLoadedView } from "@app/views/projects/router";

  import { unreachable } from "@app/lib/utils";

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

  export let baseUrl: BaseUrl;
  export let id: string;
  export let project: Project;
  export let view: ProjectLoadedView;

  let peer: string | undefined;
  $: if (view.resource === "tree" || view.resource === "history") {
    peer = view.peer;
  } else {
    peer = undefined;
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
</style>

<div class="header">
  <ProjectMeta
    nodeId={peer}
    projectDescription={project.description}
    projectId={id}
    projectName={project.name}
    {baseUrl} />
  <Header
    openIssueCount={project.issues.open}
    openPatchCount={project.patches.open}
    projectId={id}
    projectName={project.name}
    resource={view.resource}
    trackings={project.trackings}
    {baseUrl} />
</div>

<main>
  {#if view.resource === "tree"}
    <Browser
      blobResult={view.blobResult}
      branches={view.params.loadedBranches}
      commitCount={view.params.loadedTree.stats.commits}
      contributorCount={view.params.loadedTree.stats.contributors}
      path={view.path}
      peers={view.params.loadedPeers}
      tree={view.params.loadedTree}
      {baseUrl}
      {peer}
      {project}
      revision={view.revision}
      {view} />
  {:else if view.resource === "history"}
    <History
      branches={view.params.loadedBranches}
      commitCount={view.params.loadedTree.stats.commits}
      commitHeaders={view.commitHeaders}
      contributorCount={view.params.loadedTree.stats.contributors}
      peers={view.params.loadedPeers}
      totalCommitCount={view.totalCommitCount}
      {baseUrl}
      {peer}
      {project}
      revision={view.revision}
      {view} />
  {:else if view.resource === "commit"}
    <Commit commit={view.commit} {baseUrl} {project} />
  {:else if view.resource === "issues"}
    <Issues
      {baseUrl}
      projectId={id}
      issueCounters={project.issues}
      state={view.state} />
  {:else if view.resource === "newIssue"}
    <NewIssue projectId={id} projectHead={project.head} {baseUrl} />
  {:else if view.resource === "issue"}
    <Issue
      projectId={id}
      projectHead={project.head}
      {baseUrl}
      issue={view.issue} />
  {:else if view.resource === "patches"}
    <Patches
      {baseUrl}
      projectId={id}
      patchCounters={project.patches}
      search={view.search} />
  {:else if view.resource === "patch"}
    <Patch
      patch={view.patch}
      {baseUrl}
      projectId={id}
      projectDefaultBranch={project.defaultBranch}
      projectHead={project.head}
      {view} />
  {:else}
    {unreachable(view)}
  {/if}
</main>
