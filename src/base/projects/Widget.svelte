<script type="typescript">
  import { onMount } from 'svelte';
  import type { Config } from '@app/config';

  import { getMetadata } from './Project';
  import type { Project, Meta } from './Project';

  enum Status { Loading, Loaded, Error }

  type State =
      { status: Status.Loading }
    | { status: Status.Loaded, meta: Meta | null }
    | { status: Status.Error, error: string };

  export let project: Project;
  export let config: Config;

  let state: State = { status: Status.Loading };

  onMount(async () => {
    try {
      const meta = await getMetadata(project.id, config);
      state = { status: Status.Loaded, meta };
    } catch (err) {
      state = { status: Status.Error, error: err.message };
    }
  });
</script>

<style>
  article {
    padding: 1rem;
    border: 1px solid var(--color-secondary);
  }
  article .id {
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  article .anchor {
    color: var(--color-secondary);
    font-size: 0.75rem;
    font-family: var(--font-family-monospace);
  }
</style>

<article>
  {#if state.status == Status.Loaded && state.meta}
    <div class="name">{state.meta.name}</div>
    <div class="description">{state.meta.description}</div>
    <div class="id">{project.id}</div>
    <div class="anchor">commit {project.stateHash}</div>
  {:else}
    <div class="id">{project.id}</div>
    <div class="anchor">commit {project.stateHash}</div>
    {#if state.status == Status.Error}
      <span class="faded small"><strong>Error</strong>: {state.error}</span>
    {/if}
  {/if}
</article>
