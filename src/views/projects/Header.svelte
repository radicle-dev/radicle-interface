<script lang="ts">
  import type { Project } from "@app/lib/project";
  import type { Tree } from "@app/lib/project";
  import type { ProjectRoute } from "@app/lib/router/definitions";

  import * as router from "@app/lib/router";
  import BranchSelector from "@app/views/projects/BranchSelector.svelte";
  import CloneButton from "@app/views/projects/CloneButton.svelte";
  import HeaderToggleLabel from "@app/views/projects/HeaderToggleLabel.svelte";
  import PeerSelector from "@app/views/projects/PeerSelector.svelte";
  import { closeFocused } from "@app/components/Floating.svelte";
  import { config } from "@app/lib/config";

  export let activeRoute: ProjectRoute;
  export let project: Project;
  export let tree: Tree;
  export let commit: string;

  const { id, peers, peer, seed } = project;

  $: revision = activeRoute.params.revision ?? commit;

  // Switches between project views.
  const toggleContent = (
    input: "issues" | "history",
    keepSourceInPath: boolean,
  ) => {
    router.updateProjectRoute({
      view: {
        resource: activeRoute.params.view.resource === input ? "tree" : input,
      },
      id: project.id,
      revision: revision,
      search: undefined,
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
    if (seed.addr.port !== config.seeds.defaultHttpdPort) {
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
    branches={peer?.heads}
    {project}
    {revision}
    on:branchChanged={event => updateRevision(event.detail)} />

  {#if seed.addr.host}
    <CloneButton seedHost={seed.addr.host} {id} name={project.name} />
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
  <HeaderToggleLabel
    ariaLabel="Issue count"
    active={activeRoute.params.view.resource === "issues"}
    clickable
    on:click={() => toggleContent("issues", false)}>
    <span class="txt-bold">{project.issues.open ?? 0}</span>
    issue(s)
  </HeaderToggleLabel>
  <HeaderToggleLabel ariaLabel="Contributor count">
    <span class="txt-bold">{tree.stats.contributors}</span>
    contributor(s)
  </HeaderToggleLabel>
</header>
