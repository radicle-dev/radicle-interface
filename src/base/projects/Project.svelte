<script lang="ts">
  import type { Config } from "@app/config";
  import type { State as IssueState } from "./Issues.svelte";

  import * as proj from "@app/project";
  import Placeholder from "@app/Placeholder.svelte";
  import Loading from "@app/Loading.svelte";
  import { formatProfile, formatSeedId, setOpenGraphMetaTag } from "@app/utils";
  import { browserStore } from "@app/project";
  import * as patch from "@app/patch";
  import * as issue from "@app/issue";

  import Header from "@app/base/projects/Header.svelte";
  import Async from "@app/Async.svelte";

  import Browser from "./Browser.svelte";
  import Commit from "./Commit.svelte";
  import History from "./History.svelte";
  import Issues from "./Issues.svelte";
  import Issue from "./Issue.svelte";
  import ProjectMeta from "./ProjectMeta.svelte";
  import Patches from "./Patches.svelte";
  import Patch from "./Patch.svelte";

  export let peer: string | null = null;
  export let config: Config;
  export let project: proj.Project;
  export let content: proj.ProjectContent;
  export let revision: string | null;

  const parentName = project.profile
    ? formatProfile(project.profile.nameOrAddress, config)
    : null;
  let pageTitle = parentName ? `${parentName}/${project.name}` : project.name;

  $: issueFilter = ($browserStore.search?.get("state") as IssueState) ?? "open";

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
  .content {
    padding: 0 2rem 0 8rem;
  }
  @media (max-width: 960px) {
    .content {
      padding-left: 2rem;
    }
  }
</style>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<ProjectMeta
  noDescription={content !== proj.ProjectContent.Tree}
  {project}
  {peer} />

{#if revision}
  {#await project.getRoot(revision)}
    <Loading center />
  {:then { tree, commit }}
    <Header {tree} {commit} {browserStore} {project} />

    {#if content === proj.ProjectContent.Tree}
      <Browser {project} {commit} {tree} {browserStore} />
    {:else if content === proj.ProjectContent.History}
      <Async
        fetch={proj.Project.getCommits(project.urn, project.seed.httpApi, {
          parent: commit,
          verified: true,
        })}
        let:result>
        <History {project} history={result} />
      </Async>
    {:else if content === proj.ProjectContent.Commit}
      <Async fetch={project.getCommit(commit)} let:result>
        <Commit {project} commit={result} />
      </Async>
    {/if}
  {:catch err}
    <div class="container center-content">
      <div class="error error-message txt-tiny">
        <!-- TODO: Differentiate between (1) commit doesn't exist and (2) failed
             to fetch - this needs a change to the backend. -->
        API request to
        <span class="txt-monospace">{err.url}</span>
        failed
      </div>
    </div>
  {/await}

  {#if content === proj.ProjectContent.Issues}
    <Async
      fetch={issue.Issue.getIssues(project.urn, project.seed.httpApi)}
      let:result>
      <Issues {project} state={issueFilter} {config} issues={result} />
    </Async>
  {:else if content === proj.ProjectContent.Issue && $browserStore.issue}
    <Async
      fetch={issue.Issue.getIssue(
        project.urn,
        $browserStore.issue,
        project.seed.httpApi,
      )}
      let:result>
      <Issue {project} {config} issue={result} />
    </Async>
  {:else if content === proj.ProjectContent.Patches}
    <Async
      fetch={patch.Patch.getPatches(project.urn, project.seed.httpApi)}
      let:result>
      <Patches {project} {config} patches={result} />
    </Async>
  {:else if content === proj.ProjectContent.Patch && $browserStore.patch}
    <Async
      fetch={patch.Patch.getPatch(
        project.urn,
        $browserStore.patch,
        project.seed.httpApi,
      )}
      let:result>
      <Patch {project} {config} patch={result} />
    </Async>
  {/if}
{:else}
  <div class="content">
    {#if peer}
      <Placeholder icon="🍂">
        <span slot="title">
          <span class="txt-monospace">{formatSeedId(peer)}</span>
        </span>
        <span slot="body">Couldn't load remote source tree.</span>
      </Placeholder>
    {:else}
      <Placeholder icon="🍂">
        <span slot="body">Couldn't load source tree.</span>
      </Placeholder>
    {/if}
  </div>
{/if}
