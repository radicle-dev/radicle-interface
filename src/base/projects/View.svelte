<script lang="ts">
  import { Link } from "svelte-routing";
  import type { Config } from "@app/config";
  import * as proj from "@app/project";
  import Loading from "@app/Components/Loading.svelte";
  import Modal from "@app/Components/Modal/Modal.svelte";
  import Blockies from "@app/Blockies.svelte";

  import Browser from "./Browser.svelte";

  export let urn: string;
  export let org = "";
  export let commit = "";
  export let config: Config;
  export let path: string;

  let getProject = proj.getInfo(urn, config);
  let projectRoot = proj.path({ urn, org, commit });

  const back = () => window.history.back();
</script>

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
    <Browser {urn} {org} commit={commit || project.head} {path} {config} />
  {:catch}
    <Modal subtle>
      <span slot="title">🏜️</span>
      <span slot="body">
        <p class="highlight"><strong>{urn}</strong></p>
        <p>This project was not found.</p>
      </span>
      <span slot="actions">
        <button on:click={back}> Back </button>
      </span>
    </Modal>
  {/await}
</main>

<style>
  main {
    width: 100%;
    max-width: var(--content-max-width);
    min-width: var(--content-min-width);
    padding: 4rem 0;
  }
  main > header {
    padding: 0 2rem 0 8rem;
  }

  @media (max-width: 800px) {
    main > header {
      padding-left: 2rem;
    }
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
  .maintainers {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .maintainer {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    margin-left: 0.5rem;
  }
</style>
