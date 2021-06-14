<script lang="typescript">
  import { Link, navigate } from 'svelte-routing';
  import type { Config } from '@app/config';
  import * as proj from '@app/project';
  import Loading from '@app/Loading.svelte';
  import Modal from '@app/Modal.svelte';
  import Blockies from '@app/Blockies.svelte';

  import Browser from './Browser.svelte';

  export let urn: string;
  export let org = "";
  export let commit = "";
  export let config: Config;
  export let path: string;

  let getProject = proj.getInfo(urn, config);
  let projectRoot = proj.path({ urn, org, commit });

  const onSelect = ({ detail: path }: { detail: string }) => {
    navigate(proj.path({ urn, org, commit, path }));
  };
  const back = () => window.history.back();
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
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .urn {
    font-family: var(--font-family-monospace);
    font-size: 0.75rem;
    color: var(--color-foreground-faded);
  }
  .description {
    margin: 1rem 0 1.5rem 0;
  }
  .maintainer {
    display: inline-block;
    width: 1rem;
    height: 1rem;
  }
</style>

<main>
  {#await getProject}
    <header>
      <Loading small />
    </header>
  {:then project}
    <header>
      <div class="title bold">
        <Link to={projectRoot}>{project.meta.name}</Link>
        <span class="maintainers">
          {#each project.meta.maintainers as user}
            <span class="maintainer">
              <Blockies address={user} />
            </span>
          {/each}
        </span>
      </div>
      <div class="urn">{urn}</div>
      <div class="description">{project.meta.description}</div>
    </header>
    <Browser {urn} {org} commit={commit || project.head} {path} {onSelect} {config} />
  {:catch}
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
  {/await}
</main>
