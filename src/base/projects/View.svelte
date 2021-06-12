<script lang="typescript">
  import { onMount } from 'svelte';
  import { Link, navigate } from 'svelte-routing';
  import type { Config } from '@app/config';
  import * as proj from '@app/project';
  import Loading from '@app/Loading.svelte';
  import Modal from '@app/Modal.svelte';

  import Browser from './Browser.svelte';

  enum State {
    Loading,
  };

  export let urn: string;
  export let org: string | undefined;
  export let commit: string | undefined;
  export let config: Config;
  export let path: string;

  let project: State.Loading | proj.Info | null = null;
  let projectRoot = proj.path({ urn, org, commit });

  const onSelect = ({ detail: path }: { detail: string }) => {
    navigate(proj.path({ urn, org, commit, path }));
  };
  const back = () => window.history.back();

  onMount(async () => {
    try {
      project = State.Loading;
      project = await proj.getInfo(urn, config);
    } catch {
      project = null;
    }
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
    <Browser {urn} {org} commit={commit || project.head} {path} {onSelect} {config} />
  {:else}
    <Modal subtle>
      <span slot="title">🏜️</span>
      <span slot="body">
        <p class="highlight"><strong>{urn}</strong></p>
        <p>This project was not found.</p>
      </span>
      <span slot="actions">
        <button on:click={back}>
          Back
        </button>
      </span>
    </Modal>
  {/if}
</main>
