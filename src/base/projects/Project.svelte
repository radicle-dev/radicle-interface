<script lang="ts" context="module">
  async function resolveProject(
    params: ProjectParams,
    config: Config,
  ): Promise<{
    project: proj.Project;
    tree: proj.Tree;
    commit: string;
    path: string;
    line: number | null;
    revision: string | null;
  }> {
    const project = await proj.Project.get(
      params.urn,
      params.peer,
      params.profileName,
      params.seedHost,
      config,
    );

    const parsed = proj.parseRoute(params.restRoute || "", project.branches);
    const path = parsed.path || "/";
    const revision = parsed.revision || project.head;
    const line = parsed.line || null;

    const root = await project.getRoot(revision);
    return {
      project,
      path,
      line,
      tree: root.tree,
      commit: root.commit,
      revision,
    };
  }
</script>

<script lang="ts">
  import type { Config } from "@app/config";
  import type { ProjectParams } from "@app/router/definitions";

  import * as issue from "@app/issue";
  import * as patch from "@app/patch";
  import * as proj from "@app/project";
  import Placeholder from "@app/Placeholder.svelte";
  import { formatProfile, formatSeedId } from "@app/utils";

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

  export let config: Config;
  export let params: ProjectParams;
  export let type: string;

  let revision: string | null = null;
  let commit: string | null = null;
  let line: number | null = null;
  let path: string | null = null;
  let project: proj.Project | null = null;
  let tree: proj.Tree | null = null;
  let pageTitle = params.urn;

  $: if (project) {
    const parentName = project.profile
      ? formatProfile(project.profile.nameOrAddress, config)
      : null;
    pageTitle = parentName ? `${parentName}/${project.name}` : project.name;

    const baseName = parentName
      ? `${parentName}/${project.name}`
      : project.name;

    if (project.description) {
      pageTitle = `${baseName}: ${project.description}`;
    } else {
      pageTitle = baseName;
    }
  }

  resolveProject(params, config).then(result => {
    commit = result.commit;
    revision = result.revision;
    line = result.line;
    path = result.path;
    project = result.project;
    tree = result.tree;
  });
</script>

<style>
  main {
    width: 100%;
    max-width: var(--content-max-width);
    min-width: var(--content-min-width);
    padding: 4rem 0;
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
  <title>{pageTitle}</title>
</svelte:head>

{#if project}
  <main>
    <ProjectMeta
      {project}
      noDescription={params.content !== "tree"}
      peer={params.peer} />

    {#if tree && commit && path}
      <Header
        {tree}
        {project}
        {revision}
        peer={params.peer}
        content={params.content} />

      {#if params.content === "tree"}
        <Browser {path} {line} {project} {commit} {tree} />
      {:else if params.content === "history"}
        <Async
          fetch={proj.Project.getCommits(project.urn, project.seed.api, {
            parent: commit,
            verified: true,
          })}
          let:result>
          <History {project} history={result} />
        </Async>
      {:else if params.content === "commits"}
        <Async fetch={project.getCommit(commit)} let:result>
          <Commit commit={result} />
        </Async>
      {/if}

      {#if params.content === "issues"}
        <Async
          fetch={issue.Issue.getIssues(project.urn, project.seed.api)}
          let:result>
          <Issues {config} issues={result} state="open" />
        </Async>
      {:else if params.content === "issue" && params.issue}
        <Async
          fetch={issue.Issue.getIssue(
            project.urn,
            params.issue,
            project.seed.api,
          )}
          let:result>
          <Issue {project} {config} issue={result} />
        </Async>
      {:else if params.content === "patches"}
        <Async
          fetch={patch.Patch.getPatches(project.urn, project.seed.api)}
          let:result>
          <Patches {config} patches={result} />
        </Async>
      {:else if params.content === "patch" && params.patch}
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
        {#if params.peer}
          <Placeholder icon="🍂">
            <span slot="title">
              <span class="txt-monospace">{formatSeedId(params.peer)}</span>
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
