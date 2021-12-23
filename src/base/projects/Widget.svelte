<script lang="ts">
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import type { Config } from '@app/config';
  import * as proj from '@app/project';
  import Loading from '@app/Loading.svelte';
  import Blockies from '@app/Blockies.svelte';
  import { formatRadicleUrn } from '@app/utils';

  enum Status { Loading, Loaded, Error }

  type State =
      { status: Status.Loading }
    | { status: Status.Loaded }
    | { status: Status.Error; error: string };

  export let project: proj.Project;
  export let config: Config;
  export let org: string | undefined = undefined;
  export let user: string | undefined = undefined;
  export let faded = false;

  let state: State = { status: Status.Loading };
  let info: proj.Info | null = null;

  onMount(async () => {
    try {
      const result = await proj.getInfo(project.id, config);
      state = { status: Status.Loaded };
      info = result;
    } catch (err) {
      console.error(err.message);
      state = { status: Status.Error, error: err.message };
    }
  });

  const onClick = () => {
    if (info) {
      navigate(
        proj.path({
          urn: project.id,
          org,
          user,
          revision: project.anchor?.stateHash,
        })
      );
    }
  };
</script>

<style>
  article {
    padding: 1rem;
    border: 1px solid var(--color-secondary-faded);
    border-radius: 0.25rem;
    min-width: 36rem;
  }
  article.has-info {
    cursor: pointer;
  }
  article.project-faded {
    border: 1px dashed var(--color-foreground-subtle);
    cursor: not-allowed;
  }
  article.has-info:hover {
    border-color: var(--color-secondary);
  }
  article.project-faded.has-info:hover {
    border-color: var(--color-foreground-faded);
  }
  article .id {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  article .description {
    margin-bottom: 0.25rem;
    font-size: 0.75rem;
  }
  article .anchor {
    color: var(--color-secondary);
    font-size: 0.75rem;
    min-height: 2rem;
    display: flex;
    align-items: center;
  }
  article .commit, article .actions {
    font-family: var(--font-family-monospace);
  }
  article.project-faded .anchor {
    color: var(--color-foreground-faded);
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
  @media (max-width: 720px) {
    article {
      min-width: 0;
    }
  }
</style>

<article on:click={onClick} class:has-info={info} class:project-faded={faded}>
  {#if info}
    <div class="id">
      <span class="name">{info.meta.name}</span>
      <span class="urn desktop">{project.id}</span>
    </div>
    <div class="description">{info.meta.description}</div>
    <div class="anchor">
      <span class="commit">
        <slot name="stateHash"></slot>
      </span>
      <span>
        {#each info.meta.maintainers as urn}
          <span class="avatar">
            <Blockies address={urn} />
          </span>
        {/each}
      </span>
    </div>
  {:else}
    <div class="id">
      <span class="desktop">{project.id}</span>
      <span class="mobile">{formatRadicleUrn(project.id)}</span>
      {#if state.status == Status.Loading}
        <Loading small />
      {/if}
    </div>
    <div class="anchor">
      <span class="commit">
        <slot name="stateHash"></slot>
      </span>
      <span class="actions">
        <slot name="actions" />
      </span>
    </div>
  {/if}
</article>
