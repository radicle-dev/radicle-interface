<script type="typescript">
  import { onMount } from 'svelte';
  import type { Config } from '@app/config';
  import Loading from '@app/Loading.svelte';

  import { getMetadata } from './Project';
  import type { Project, Meta } from './Project';

  enum Status { Loading, Loaded, Error }

  type State =
      { status: Status.Loading }
    | { status: Status.Loaded }
    | { status: Status.Error, error: string };

  export let project: Project;
  export let config: Config;

  let state: State = { status: Status.Loading };
  let meta: Meta | null = null;

  onMount(async () => {
    try {
      const result = await getMetadata(project.id, config);
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
  article .id {
    display: flex;
    justify-content: space-between;
  }
</style>

<article>
  {#if meta}
    <div class="name">{meta.name}</div>
    <div class="description">{meta.description}</div>
    <div class="id">{project.id}</div>
    <div class="anchor">commit {project.stateHash}</div>
  {:else}
    <div class="id">
      <span>{project.id}</span>
      {#if state.status == Status.Loading}
        <Loading small />
      {/if}
    </div>
    <div class="anchor">commit {project.stateHash}</div>
    {#if state.status == Status.Error}
      <span class="faded small"><strong>Error</strong>: {state.error}</span>
    {/if}
  {/if}
</article>
