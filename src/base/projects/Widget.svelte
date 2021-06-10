<script type="typescript">
  import { onMount } from 'svelte';
  import type { Config } from '@app/config';
  import * as proj from '@app/project';
  import Loading from '@app/Loading.svelte';
  import Blockies from '@app/Blockies.svelte';

  enum Status { Loading, Loaded, Error }

  type State =
      { status: Status.Loading }
    | { status: Status.Loaded }
    | { status: Status.Error, error: string };

  export let project: proj.Project;
  export let config: Config;

  let state: State = { status: Status.Loading };
  let meta: proj.Meta | null = null;

  onMount(async () => {
    try {
      const result = await proj.getMetadata(project.id, config);
      state = { status: Status.Loaded };
      meta = result;
    } catch (err) {
      state = { status: Status.Error, error: err.message };
    }
  });
</script>

<style>
  article {
    padding: 1rem;
    border: 1px solid var(--color-secondary-faded);
  }
  article .id {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  article .description {
    margin-bottom: 0.5rem;
    font-size: 0.75rem;
  }
  article .anchor {
    color: var(--color-secondary);
    font-size: 0.75rem;
    font-family: var(--font-family-monospace);
  }
  article .id, article .anchor {
    display: flex;
    justify-content: space-between;
  }
  article .id .urn {
    visibility: hidden;
    color: var(--color-foreground-faded);
    font-weight: normal;
    font-family: var(--font-family-monospace);
    font-size: 0.75rem;
  }
  article:hover .id .urn {
    visibility: visible;
  }
  article .avatar {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    width: 1.25rem;
    height: 1.25rem;
    font-size: 0.5rem;
  }
</style>

<article>
  {#if meta}
    <div class="id">
      <span class="name">{meta.name}</span><span class="urn">{project.id}</span>
    </div>
    <div class="description">{meta.description}</div>
    <div class="anchor">
      <span>commit {project.anchor.stateHash}</span>
      <span>
        {#each meta.maintainers as urn}
          <span class="avatar">
            <Blockies address={urn} />
          </span>
        {/each}
      </span>
    </div>
  {:else}
    <div class="id">
      <span>{project.id}</span>
      {#if state.status == Status.Loading}
        <Loading small />
      {/if}
    </div>
    <div class="anchor">commit {project.anchor.stateHash}</div>
  {/if}
</article>
