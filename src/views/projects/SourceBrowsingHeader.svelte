<script lang="ts">
  import type { Project, Remote } from "@httpd-client";
  import type { ProjectLoadedView } from "@app/views/projects/router";

  import { closeFocused } from "@app/components/Floating.svelte";
  import { pluralize } from "@app/lib/pluralize";

  import BranchSelector from "@app/views/projects/BranchSelector.svelte";
  import PeerSelector from "@app/views/projects/PeerSelector.svelte";
  import ProjectLink from "@app/components/ProjectLink.svelte";
  import SquareButton from "@app/components/SquareButton.svelte";

  export let project: Project;
  export let peer: string | undefined = undefined;
  export let revision: string | undefined;
  export let peers: Remote[];
  export let branches: Record<string, string>;
  export let view: ProjectLoadedView;

  export let commitCount: number;
  export let contributorCount: number;
</script>

<style>
  .header {
    font-size: var(--font-size-tiny);
    padding: 0 2rem 0 8rem;
    display: flex;
    align-items: center;
    justify-content: left;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 2rem;
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
    <PeerSelector {peers} {peer} on:click={() => closeFocused()} />
  {/if}

  <BranchSelector
    {branches}
    {revision}
    on:click={() => closeFocused()}
    projectDefaultBranch={project.defaultBranch} />

  <ProjectLink
    projectParams={{
      id: project.id,
      view: {
        resource: "history",
      },
      revision,
    }}>
    <SquareButton
      active={view.resource === "history" || view.resource === "commits"}>
      <span class="txt-bold">{commitCount}</span>
      {pluralize("commit", commitCount)}
    </SquareButton>
  </ProjectLink>

  <SquareButton hoverable={false}>
    <span class="txt-bold">{contributorCount}</span>
    {pluralize("contributor", contributorCount)}
  </SquareButton>
</div>
