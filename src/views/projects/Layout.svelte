<script lang="ts">
  import type { ActiveTab } from "./Header.svelte";
  import type { BaseUrl, Project } from "@httpd-client";

  import Header from "./Header.svelte";
  import ProjectMeta from "./ProjectMeta.svelte";

  export let baseUrl: BaseUrl;
  export let project: Project;
  export let peer: string | undefined = undefined;
  export let activeTab: ActiveTab = undefined;
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
    trackings={project.trackings}
    {activeTab}
    {baseUrl} />
</div>

<main>
  <slot />
</main>
