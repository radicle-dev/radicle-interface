<script lang="ts">
  import type { Config } from "@app/config";
  import type { ProjectParams } from "@app/router/definitions";

  import * as proj from "@app/project";
  import Placeholder from "@app/Placeholder.svelte";
  import Loading from "@app/Loading.svelte";
  import { formatSeedId } from "@app/utils";
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
  import { onMount } from "svelte";

  export let params: ProjectParams;
  export let config: Config;

  let project: proj.Project | null = null;

  let revision: string | null = null;
  let path: string | null = null;
  let line: number | null = null;

  onMount(async () => {
    project = await proj.Project.get(
      params.urn,
      peer,
      params.profileName,
      params.seedHost,
      config,
    );
  });

  $: if (project) {
    const parsed = proj.parseRoute(params.restRoute || "", project.branches);
    path = parsed.path || "/";
    revision = parsed.revision || project.head;
    line = parsed.line || null;
  }

  $: content = params.content;
  $: peer = params.peer;
</script>

<style>
  main {
    width: 100%;
    max-width: var(--content-max-width);
    min-width: var(--content-min-width);
    padding: 4rem 0;
  }
  main > header {
    padding: 0 2rem 0 8rem;
  }

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
  <title>{project?.name}</title>
</svelte:head>

{#if project}
  <main>
    <ProjectMeta noDescription={content !== "tree"} {project} {peer} />

    {#if revision && path}
      {#await project.getRoot(revision)}
        <header>
          <Loading center />
        </header>
      {:then { tree, commit }}
        <Header
          {tree}
          {peer}
          {project}
          revision={commit}
          content={params.content} />

        {#if content === "tree"}
          <Browser {path} {line} {project} {commit} {tree} />
        {:else if content === "history"}
          <Async
            fetch={proj.Project.getCommits(project.urn, project.seed.api, {
              parent: commit,
              verified: true,
            })}
            let:result>
            <History {project} history={result} />
          </Async>
        {:else if content === "commit"}
          <Async fetch={project.getCommit(commit)} let:result>
            <Commit commit={result} />
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

      {#if content === "issues"}
        <Async
          fetch={issue.Issue.getIssues(project.urn, project.seed.api)}
          let:result>
          <Issues {config} issues={result} state="open" />
        </Async>
      {:else if content === "issue" && params.issue}
        <Async
          fetch={issue.Issue.getIssue(
            project.urn,
            params.issue,
            project.seed.api,
          )}
          let:result>
          <Issue {project} {config} issue={result} />
        </Async>
      {:else if content === "patches"}
        <Async
          fetch={patch.Patch.getPatches(project.urn, project.seed.api)}
          let:result>
          <Patches {config} patches={result} />
        </Async>
      {:else if content === "patch" && params.patch}
        <Async
          fetch={patch.Patch.getPatch(
            project.urn,
            params.patch,
            project.seed.api,
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
  </main>
{/if}
