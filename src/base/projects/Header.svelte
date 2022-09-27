<script lang="ts">
  import type { Writable } from "svelte/store";
  import { navigate } from "svelte-routing";
  import type { Browser } from "@app/project";
  import { ProjectContent, Project } from "@app/project";
  import BranchSelector from "@app/base/projects/BranchSelector.svelte";
  import CloneButton from "@app/base/projects/CloneButton.svelte";
  import PeerSelector from "@app/base/projects/PeerSelector.svelte";
  import type { Tree } from "@app/project";

  export let project: Project;
  export let tree: Tree;
  export let commit: string;
  export let browserStore: Writable<Browser>;

  const { urn, peers, branches, seed } = project;

  $: browser = $browserStore;
  $: revision = browser.revision || commit;
  $: content = browser.content;

  // Switches between project views.
  const toggleContent = (input: ProjectContent, keepSourceInPath: boolean) => {
    project.navigateTo({
      content: content === input ? ProjectContent.Tree : input,
      issue: null, // Removing issue here from browserStore to not contaminate path on navigation.
      patch: null, // Removing patch here from browserStore to not contaminate path on navigation.
      ...(keepSourceInPath ? null : { revision: null, path: null }),
    });
  };

  const updatePeer = (peer: string) => {
    project.navigateTo({ peer, revision: null });
  };

  const updateRevision = (revision: string) => {
    project.navigateTo({ revision });
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
      peer={browser.peer}
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
      <div
        class="stat seed clickable widget"
        title="Project data is fetched from this seed"
        on:click={() => navigate(`/seeds/${seed.api.host}`)}>
        <span>{seed.api.host}</span>
      </div>
    {/if}
  </span>
  <div
    class="stat commit-count clickable widget"
    class:active={content === ProjectContent.History}
    on:click={() => toggleContent(ProjectContent.History, true)}>
    <span class="txt-bold">{tree.stats.commits}</span>
    commit(s)
  </div>
  {#if project.issues}
    <div
      class="stat issue-count clickable widget"
      class:active={content === ProjectContent.Issues}
      class:not-allowed={project.issues === 0}
      class:clickable={project.issues > 0}
      on:click={() => toggleContent(ProjectContent.Issues, false)}>
      <span class="txt-bold">{project.issues}</span>
      issue(s)
    </div>
  {/if}
  {#if project.patches}
    <div
      class="stat patch-count clickable widget"
      class:active={content === ProjectContent.Patches}
      class:not-allowed={project.patches === 0}
      class:clickable={project.patches > 0}
      on:click={() => toggleContent(ProjectContent.Patches, false)}>
      <span class="txt-bold">{project.patches}</span>
      patch(es)
    </div>
  {/if}
  <div class="stat contributor-count widget">
    <span class="txt-bold">{tree.stats.contributors}</span>
    contributor(s)
  </div>
</header>
