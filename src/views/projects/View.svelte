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
    projectId={project.id}
    projectName={project.name}
    {baseUrl} />
  <Header
    openIssueCount={project.issues.open}
    openPatchCount={project.patches.open}
    projectId={project.id}
    projectName={project.name}
    resource={view.resource}
    trackings={project.trackings}
    {baseUrl} />
</div>

<main>
  {#if view.resource === "tree"}
    <Browser {...view} {baseUrl} {project} />
  {:else if view.resource === "history"}
    <History {...view} {baseUrl} {project} />
  {:else if view.resource === "commit"}
    <Commit {...view} {baseUrl} {project} />
  {:else if view.resource === "issues"}
    <Issues {...view} {baseUrl} {project} />
  {:else if view.resource === "newIssue"}
    <NewIssue {baseUrl} {project} />
  {:else if view.resource === "issue"}
    <Issue {...view} {baseUrl} {project} />
  {:else if view.resource === "patches"}
    <Patches {...view} {baseUrl} {project} />
  {:else if view.resource === "patch"}
    <Patch {...view} {baseUrl} {project} />
  {:else}
    {unreachable(view)}
  {/if}
</main>
