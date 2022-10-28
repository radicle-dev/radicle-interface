<script lang="ts">
  import type { Project } from "@app/project";
  import type { Tree } from "@app/project";
  import type { ProjectRoute } from "@app/router/definitions";

  import { navigate, activeRouteStore } from "@app/router";
  import BranchSelector from "@app/base/projects/BranchSelector.svelte";
  import CloneButton from "@app/base/projects/CloneButton.svelte";
  import PeerSelector from "@app/base/projects/PeerSelector.svelte";
  import { closeFocused } from "@app/Floating.svelte";

  export let project: Project;
  export let tree: Tree;
  export let commit: string;

  const { urn, peers, branches, seed } = project;

  $: route = $activeRouteStore as ProjectRoute;
  $: revision = route.params.revision || commit;
  $: content = route.params.content;
  $: peer = route.params.peer;

  // Switches between project views.
  const toggleContent = (
    input: "patches" | "issues" | "commits",
    keepSourceInPath: boolean,
  ) => {
    navigate({
      type: "projects",
      params: {
        activeView: { type: content === input ? "tree" : input },
        urn: project.urn,
        content: content === input ? "tree" : input,
        revision,
        ...(keepSourceInPath ? null : { revision: null, path: null }),
      },
    });
  };

  const updatePeer = (peer: string) => {
    navigate({
      type: "projects",
      params: {
        activeView: { type: "tree" },
        urn: project.urn,
        peer,
        revision: null,
        path: null,
      },
    });
    closeFocused();
  };

  const updateRevision = (revision: string) => {
    navigate({
      type: "projects",
      params: {
        activeView: { type: "tree" },
        urn: project.urn,
        route: null,
        revision,
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
    class:active={content === "commits"}
    on:click={() => toggleContent("commits", true)}>
    <span class="txt-bold">{tree.stats.commits}</span>
    commit(s)
  </div>
  {#if project.issues}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      class="stat issue-count clickable widget"
      class:active={content === "issues"}
      class:not-allowed={project.issues === 0}
      class:clickable={project.issues > 0}
      on:click={() => toggleContent("issues", false)}>
      <span class="txt-bold">{project.issues}</span>
      issue(s)
    </div>
  {/if}
  {#if project.patches}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      class="stat patch-count clickable widget"
      class:active={content === "patches"}
      class:not-allowed={project.patches === 0}
      class:clickable={project.patches > 0}
      on:click={() => toggleContent("patches", false)}>
      <span class="txt-bold">{project.patches}</span>
      patch(es)
    </div>
  {/if}
  <div class="stat contributor-count widget">
    <span class="txt-bold">{tree.stats.contributors}</span>
    contributor(s)
  </div>
</header>
