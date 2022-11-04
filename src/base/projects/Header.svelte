<script lang="ts">
  import type { Project } from "@app/project";
  import type { Tree } from "@app/project";
  import type { ProjectRoute } from "@app/router/definitions";

  import * as router from "@app/router";
  import BranchSelector from "@app/base/projects/BranchSelector.svelte";
  import CloneButton from "@app/base/projects/CloneButton.svelte";
  import PeerSelector from "@app/base/projects/PeerSelector.svelte";
  import { closeFocused } from "@app/Floating.svelte";
  import Stat from "@app/base/projects/Stat.svelte";

  export let activeRoute: ProjectRoute;
  export let project: Project;
  export let tree: Tree;
  export let commit: string;

  const { urn, peers, branches, seed } = project;

  $: revision = activeRoute.params.revision ?? commit;

  // Switches between project views.
  const toggleContent = (
    input: "patches" | "issues" | "history",
    keepSourceInPath: boolean,
  ) => {
    router.updateProjectRoute({
      view: {
        resource: activeRoute.params.view.resource === input ? "tree" : input,
      },
      urn: project.urn,
      revision: revision,
      ...(keepSourceInPath ? null : { revision: undefined, path: undefined }),
    });
  };

  const updatePeer = (peer: string) => {
    router.updateProjectRoute({
      peer,
      revision: undefined,
    });
    closeFocused();
  };

  const updateRevision = (revision: string) => {
    router.updateProjectRoute({
      revision,
    });
    closeFocused();
  };

  function goToSeed() {
    if (seed.api.port) {
      router.push({
        resource: "seeds",
        params: { host: `${seed.api.host}:${seed.api.port}` },
      });
    } else {
      router.push({ resource: "seeds", params: { host: seed.api.host } });
    }
  }
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
      peer={activeRoute.params.peer}
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
      <Stat
        clickable
        title="Project data is fetched from this seed"
        on:click={goToSeed}>
        <span>{seed.api.host}</span>
      </Stat>
    {/if}
  </span>
  <Stat
    clickable
    active={activeRoute.params.view.resource === "history"}
    on:click={() => toggleContent("history", true)}>
    <span class="txt-bold">{tree.stats.commits}</span>
    commit(s)
  </Stat>
  {#if project.issues}
    <Stat
      active={activeRoute.params.view.resource === "issues"}
      notAllowed={project.issues === 0}
      clickable={project.issues > 0}
      on:click={() => toggleContent("issues", false)}>
      <span class="txt-bold">{project.issues}</span>
      issue(s)
    </Stat>
  {/if}
  {#if project.patches}
    <Stat
      clickable={project.patches > 0}
      active={activeRoute.params.view.resource === "patches"}
      disabled={project.patches === 0}
      on:click={() => toggleContent("patches", false)}>
      <span class="txt-bold">{project.patches}</span>
      patch(es)
    </Stat>
  {/if}
  <Stat>
    <span class="txt-bold">{tree.stats.contributors}</span>
    contributor(s)
  </Stat>
</header>
