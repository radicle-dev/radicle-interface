<script lang="ts">
  import type { Branches, Project } from "@app/project";
  import type { LoadedProjectView, ProjectView } from "./route";

  import BranchSelector from "@app/base/projects/BranchSelector.svelte";
  import CloneButton from "@app/base/projects/CloneButton.svelte";
  import PeerSelector from "@app/base/projects/PeerSelector.svelte";
  import { navigate } from "@app/router";
  import { closeFocused } from "@app/Floating.svelte";

  export let peer: string | undefined;
  export let project: Project;
  export let branches: Branches;
  export let revision: string;
  export let activeView: LoadedProjectView;

  const { urn, peers, seed } = project;

  // Switches between project views.
  const toggleContent = async (activeView: ProjectView) => {
    await navigate({
      type: "projects",
      params: { urn, activeView },
    });
    closeFocused();
  };

  const updatePeer = async (peer: string) => {
    await navigate({
      type: "projects",
      params: { urn, peer },
    });
    closeFocused();
  };

  const updateRevision = async (revision: string) => {
    await navigate({
      type: "projects",
      params: {
        urn,
        activeView: {
          type: "tree",
          revision,
          path: "path" in activeView ? activeView.path : "",
        },
      },
    });
    closeFocused();
  };
</script>

<style>
  header {
    font-size: var(--font-size-tiny);
    padding: 0 2rem 0 8rem;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    justify-content: left;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .widget {
    border-radius: var(--border-radius-small);
    min-width: max-content;
  }
  .clickable {
    cursor: pointer;
  }
  .clickable:hover {
    background-color: var(--color-foreground-2);
  }
  .not-allowed {
    cursor: not-allowed;
  }
  .not-allowed.widget {
    color: var(--color-foreground-5);
  }
  .stat {
    font-family: var(--font-family-monospace);
    padding: 0.5rem 0.75rem;
    height: 2rem;
    line-height: initial;
    background: var(--color-foreground-1);
  }
  .stat.active {
    color: var(--color-background);
    background: var(--color-foreground);
  }

  @media (max-width: 960px) {
    header {
      padding-left: 2rem;
    }
    header {
      margin-bottom: 1.5rem;
    }
  }
</style>

<header>
  {#if peers.length > 0}
    <PeerSelector
      {peers}
      {peer}
      on:peerChanged={event => updatePeer(event.detail)} />
  {/if}

  <BranchSelector
    {branches}
    {project}
    {revision}
    on:branchChanged={event => updateRevision(event.detail)} />

  {#if seed.git.host}
    <CloneButton seedHost={seed.git.host} {urn} />
  {/if}
  <span>
    {#if seed.api.host}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        class="stat seed clickable widget"
        title="Project data is fetched from this seed"
        on:click={() => navigate(`/seeds/${seed.api.host}`)}>
        <span>{seed.api.host}</span>
      </div>
    {/if}
  </span>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    class="stat commit-count clickable widget"
    class:active={activeView.type === "commits"}
    on:click={() => toggleContent({ type: "commits", parent: "", path: "" })}>
    <span class="txt-bold">{activeView.tree.stats.commits}</span>
    commit(s)
  </div>
  {#if project.issues}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      class="stat issue-count clickable widget"
      class:active={activeView.type === "issues"}
      class:not-allowed={project.issues === 0}
      class:clickable={project.issues > 0}
      on:click={() => toggleContent({ type: "issues" })}>
      <span class="txt-bold">{project.issues}</span>
      issue(s)
    </div>
  {/if}
  {#if project.patches}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      class="stat patch-count clickable widget"
      class:active={activeView.type === "patches"}
      class:not-allowed={project.patches === 0}
      class:clickable={project.patches > 0}
      on:click={() => toggleContent({ type: "patches" })}>
      <span class="txt-bold">{project.patches}</span>
      patch(es)
    </div>
  {/if}
  <div class="stat contributor-count widget">
    <span class="txt-bold">{activeView.tree.stats.contributors}</span>
    contributor(s)
  </div>
</header>
