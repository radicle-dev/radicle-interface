<script lang="ts">
  import type { Project } from "@app/lib/project";
  import type { Tree } from "@app/lib/project";
  import type { ProjectRoute } from "@app/lib/router/definitions";

  import * as router from "@app/lib/router";
  import BranchSelector from "@app/views/projects/BranchSelector.svelte";
  import CloneButton from "@app/views/projects/CloneButton.svelte";
  import PeerSelector from "@app/views/projects/PeerSelector.svelte";
  import { closeFocused } from "@app/components/Floating.svelte";
  import HeaderToggleLabel from "@app/views/projects/HeaderToggleLabel.svelte";

  export let activeRoute: ProjectRoute;
  export let project: Project;
  export let tree: Tree;
  export let commit: string;

  const { id, peers, branches, seed } = project;

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
      id: project.id,
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
    if (seed.addr.port) {
      router.push({
        resource: "seeds",
        params: { host: `${seed.addr.host}:${seed.addr.port}` },
      });
    } else {
      router.push({ resource: "seeds", params: { host: seed.addr.host } });
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
    <CloneButton seedHost={seed.git.host} {id} />
  {/if}
  <span>
    {#if seed.addr.host}
      <HeaderToggleLabel
        clickable
        ariaLabel="Seed"
        title="Project data is fetched from this seed"
        on:click={goToSeed}>
        <span>{seed.addr.host}</span>
      </HeaderToggleLabel>
    {/if}
  </span>
  <HeaderToggleLabel
    ariaLabel="Commit count"
    clickable
    active={activeRoute.params.view.resource === "history"}
    on:click={() => toggleContent("history", true)}>
    <span class="txt-bold">{tree.stats.commits}</span>
    commit(s)
  </HeaderToggleLabel>
  {#if project.issues}
    <HeaderToggleLabel
      ariaLabel="Issue count"
      active={activeRoute.params.view.resource === "issues"}
      disabled={project.issues === 0}
      clickable={project.issues > 0}
      on:click={() => toggleContent("issues", false)}>
      <span class="txt-bold">{project.issues}</span>
      issue(s)
    </HeaderToggleLabel>
  {/if}
  {#if project.patches}
    <HeaderToggleLabel
      ariaLabel="Patch count"
      clickable={project.patches > 0}
      active={activeRoute.params.view.resource === "patches"}
      disabled={project.patches === 0}
      on:click={() => toggleContent("patches", false)}>
      <span class="txt-bold">{project.patches}</span>
      patch(es)
    </HeaderToggleLabel>
  {/if}
  <HeaderToggleLabel ariaLabel="Contributor count">
    <span class="txt-bold">{tree.stats.contributors}</span>
    contributor(s)
  </HeaderToggleLabel>
</header>
