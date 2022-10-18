<script lang="ts">
  import type { Config } from "@app/config";
  import type { ProjectView } from "./route";

  import * as issue from "@app/issue";
  import * as patch from "@app/patch";
  import * as proj from "@app/project";
  import { formatProfile, setOpenGraphMetaTag } from "@app/utils";
  import { routeLoading } from "@app/base/projects/route";

  import Async from "@app/Async.svelte";
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
  export let activeView: ProjectView;
  export let revision: string;
  export let path: string;
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
  <ProjectMeta {project} {peer} noDescription={activeView.type !== "tree"} />

  <Header
    tree={activeView.tree}
    {project}
    branches={project.branches}
    {peer}
    {revision}
    content={activeView.type} />

  {#if $routeLoading}
    <Loading center />
  {:else if activeView.type === "tree"}
    <Browser
      {path}
      line={activeView.line || null}
      {project}
      commit={activeView.commit}
      tree={activeView.tree} />
  {:else if activeView.type === "history"}
    <Async
      fetch={proj.Project.getCommits(project.urn, project.seed.api, {
        parent: activeView.commit,
        verified: true,
      })}
      let:result>
      <History {project} history={result} />
    </Async>
  {:else if activeView.type === "commits"}
    <Async fetch={project.getCommit(activeView.commit)} let:result>
      <Commit commit={result} urn={project.urn} />
    </Async>
  {/if}

  {#if activeView.type === "issues" && !activeView.issue}
    <Async
      fetch={issue.Issue.getIssues(project.urn, project.seed.api)}
      let:result>
      <Issues {config} urn={project.urn} issues={result} state="open" />
    </Async>
  {:else if activeView.type === "issues" && activeView.issue}
    <Async
      fetch={issue.Issue.getIssue(
        project.urn,
        activeView.issue,
        project.seed.api,
      )}
      let:result>
      <Issue {project} {config} issue={result} />
    </Async>
  {:else if activeView.type === "patches" && !activeView.patch}
    <Async
      fetch={patch.Patch.getPatches(project.urn, project.seed.api)}
      let:result>
      <Patches {config} urn={project.urn} patches={result} />
    </Async>
  {:else if activeView.type === "patches" && activeView.patch}
    <Async
      fetch={patch.Patch.getPatch(
        project.urn,
        activeView.patch,
        project.seed.api,
      )}
      let:result>
      <Patch {project} {config} patch={result} />
    </Async>
  {/if}
</main>
