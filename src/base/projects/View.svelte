<script lang="typescript">
  import { onMount } from 'svelte';
  import { Link, navigate } from 'svelte-routing';
  import type { Config } from '@app/config';
  import * as proj from '@app/project';
  import Loading from '@app/Loading.svelte';

  import Browser from './Browser.svelte';

  enum State {
    Loading,
  };

  export let urn: string;
  export let commit: string | null = null;
  export let config: Config;
  export let path: string;

  let project: State.Loading | proj.Info | null = null;
  let projectRoot = commit
    ? `/projects/${urn}/${commit}`
    : `/projects/${urn}`;

  const onSelect = ({ detail: path }: { detail: string }) => {
    if (commit) {
      navigate(`/projects/${urn}/${commit}/${path}`);
    } else {
      navigate(`/projects/${urn}/head/${path}`);
    }
  };

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
    padding: 0 8rem;
  }
  .title {
    font-size: 2.25rem;
    margin-bottom: 0.5rem;
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
      <div class="title bold">
        <Link to={projectRoot}>{project.meta.name}</Link>
      </div>
      <div class="urn">{urn}</div>
      <div class="description">{project.meta.description}</div>
    </header>
    <Browser {urn} commit={commit || project.head} {path} {onSelect} {config} />
  {:else}
    <!-- Not found -->
  {/if}
</main>
