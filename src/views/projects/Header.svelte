<script lang="ts">
  import type { BaseUrl, Project, Remote, Tree } from "@httpd-client";
  import type { ProjectRoute } from "@app/lib/router/definitions";

  import { closeFocused } from "@app/components/Floating.svelte";
  import { config } from "@app/lib/config";
  import { pluralize } from "@app/lib/pluralize";

  import BranchSelector from "@app/views/projects/BranchSelector.svelte";
  import CloneButton from "@app/views/projects/CloneButton.svelte";
  import Link from "@app/components/Link.svelte";
  import PeerSelector from "@app/views/projects/PeerSelector.svelte";
  import ProjectLink from "@app/components/ProjectLink.svelte";
  import SquareButton from "@app/components/SquareButton.svelte";

  export let project: Project;
  export let activeRoute: ProjectRoute;
  export let tree: Tree;
  export let commit: string;
  export let peers: Remote[];
  export let branches: Record<string, string>;
  export let baseUrl: BaseUrl;

  $: revision = activeRoute.params.revision ?? commit;
</script>

<style>
  .header {
    font-size: var(--font-size-tiny);
    padding: 0 2rem 0 8rem;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    justify-content: left;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  @media (max-width: 960px) {
    .header {
      padding-left: 2rem;
    }
    .header {
      margin-bottom: 1.5rem;
    }
  }
</style>

<div class="header">
  {#if peers.length > 0}
    <PeerSelector
      {peers}
      peer={activeRoute.params.peer}
      on:click={() => closeFocused()} />
  {/if}

  <BranchSelector
    projectDefaultBranch={project.defaultBranch}
    projectHead={project.head}
    {branches}
    {revision}
    on:click={() => closeFocused()} />

  <CloneButton {baseUrl} id={project.id} name={project.name} />

  <Link
    route={{
      resource: "seeds",
      params: {
        hostnamePort:
          baseUrl.port === config.seeds.defaultHttpdPort
            ? baseUrl.hostname
            : `${baseUrl.hostname}:${baseUrl.port}`,
      },
    }}>
    <SquareButton>
      {baseUrl.hostname}
    </SquareButton>
  </Link>

  <ProjectLink
    projectParams={{
      id: project.id,
      view: {
        resource:
          activeRoute.params.view.resource === "history" ? "tree" : "history",
      },
      revision: revision,
      search: undefined,
    }}>
    <SquareButton active={activeRoute.params.view.resource === "history"}>
      <span class="txt-bold">{tree.stats.commits}</span>
      {pluralize("commit", tree.stats.commits)}
    </SquareButton>
  </ProjectLink>

  <ProjectLink
    projectParams={{
      id: project.id,
      view: {
        resource:
          activeRoute.params.view.resource === "issues" ? "tree" : "issues",
      },
      search: undefined,
      revision: undefined,
      path: undefined,
    }}>
    <SquareButton active={activeRoute.params.view.resource === "issues"}>
      <span class="txt-bold">{project.issues.open}</span>
      {pluralize("issue", project.issues.open)}
    </SquareButton>
  </ProjectLink>

  <ProjectLink
    projectParams={{
      id: project.id,
      view: {
        resource:
          activeRoute.params.view.resource === "patches" ? "tree" : "patches",
      },
      search: undefined,
      revision: undefined,
      path: undefined,
    }}>
    <SquareButton active={activeRoute.params.view.resource === "patches"}>
      <span class="txt-bold">{project.patches.open}</span>
      {pluralize("patch", project.patches.open)}
    </SquareButton>
  </ProjectLink>

  <SquareButton hoverable={false}>
    <span class="txt-bold">{tree.stats.contributors}</span>
    {pluralize("contributor", tree.stats.contributors)}
  </SquareButton>
</div>
