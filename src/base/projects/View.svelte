<script lang="typescript">
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import type { Config } from '@app/config';
  import * as proj from '@app/project';
  import Loading from '@app/Loading.svelte';

  import Browser from './Browser.svelte';

  enum State {
    Loading,
  };

  export let urn: string;
  export let commit: string | null;
  export let config: Config;
  export let path: string;

  let project: State.Loading | proj.Info | null = null;

  onMount(async () => {
    project = State.Loading;
    project = await proj.getInfo(urn, config);
  });
</script>

<style>
  main {
    width: 100%;
    padding: 4rem 0;
  }
  main > header {
    margin-bottom: 4rem;
    padding: 0 8rem;
  }
  .title {
    font-size: 2.25rem;
    margin-bottom: 0.5rem;
  }

  .anchor {
    display: inline-block;
    font-size: 0.75rem;
    font-family: var(--font-family-monospace);
    color: var(--color-secondary);
    background-color: var(--color-secondary-background);
    padding: 0.75rem;
    border-radius: 0.25rem;
  }

  .urn {
    font-family: var(--font-family-monospace);
    font-size: 0.75rem;
    color: var(--color-foreground-faded);
  }
  .description {
    margin: 1rem 0 1.5rem 0;
  }
</style>

<main>
  {#if project === State.Loading}
    <header>
      <Loading small />
    </header>
  {:else if project}
    <header>
      <div class="title bold">{project.meta.name}</div>
      <div class="urn">{urn}</div>
      <div class="description">{project.meta.description}</div>
      <div class="anchor">
        commit {commit || project.head}
      </div>
    </header>
    <Browser {urn} commit={commit || project.head} {path} {config} />
  {:else}
    <!-- Not found -->
  {/if}
</main>
