<script lang="ts">
  import type { Config } from "@app/config";
  import type { LoadedProjectView } from "./route";
  import { routeLoading } from "./route";

  import type * as proj from "@app/project";
  import { formatProfile, setOpenGraphMetaTag } from "@app/utils";

  import Header from "@app/base/projects/Header.svelte";

  import Browser from "./Browser.svelte";
  import Commit from "./Commit.svelte";
  import History from "./History.svelte";
  import Issue from "./Issue.svelte";
  import Issues from "./Issues.svelte";
  import Patch from "./Patch.svelte";
  import Patches from "./Patches.svelte";
  import ProjectMeta from "./ProjectMeta.svelte";
  import Loading from "@app/Loading.svelte";

  export let config: Config;
  export let project: proj.Project;
  export let activeView: LoadedProjectView;
  export let revision: string;
  export let peer: string | undefined;

  const parentName = project.profile
    ? formatProfile(project.profile.nameOrAddress, config)
    : null;
  let pageTitle = parentName ? `${parentName}/${project.name}` : project.name;

  const baseName = parentName ? `${parentName}/${project.name}` : project.name;

  if (project.description) {
    pageTitle = `${baseName}: ${project.description}`;
  } else {
    pageTitle = baseName;
  }

  setOpenGraphMetaTag([
    { prop: "og:title", content: project.name },
    { prop: "og:description", content: project.description },
    { prop: "og:url", content: window.location.href },
  ]);
</script>

<style>
  main {
    width: 100%;
    max-width: var(--content-max-width);
    min-width: var(--content-min-width);
    padding: 4rem 0;
  }
</style>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<main>
  <ProjectMeta {project} {peer} />

  <Header
    {activeView}
    {project}
    {peer}
    {revision}
    branches={project.branches} />

  {#if $routeLoading}
    <Loading center />
  {:else if activeView.type === "tree"}
    <Browser
      {project}
      path={activeView.path}
      line={activeView.line}
      commit={revision}
      tree={activeView.tree} />
  {:else if activeView.type === "commits"}
    <History {project} history={activeView.commits} />
  {:else if activeView.type === "commit"}
    <Commit commit={activeView.commit} urn={project.urn} />
  {:else if activeView.type === "issues"}
    <Issues
      {config}
      urn={project.urn}
      issues={activeView.issues}
      state="open" />
  {:else if activeView.type === "issue"}
    <Issue {project} {config} issue={activeView.issue} />
  {:else if activeView.type === "patches"}
    <Patches {config} urn={project.urn} patches={activeView.patches} />
  {:else if activeView.type === "patch"}
    <Patch {project} {config} patch={activeView.patch} />
  {/if}
</main>
