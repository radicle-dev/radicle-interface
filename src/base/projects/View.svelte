<script lang="ts">
  import { Link } from 'svelte-routing';
  import type { Config } from '@app/config';
  import * as proj from '@app/project';
  import Loading from '@app/Loading.svelte';
  import Modal from '@app/Modal.svelte';
  import Avatar from '@app/Avatar.svelte';
  import { Org } from '@app/base/orgs/Org';
  import type { Profile } from '@app/profile';
  import type { Info } from '@app/project';
  import { formatOrg } from '@app/utils';

  import Browser from './Browser.svelte';

  export let urn: string;
  export let org = "";
  export let commit = "";
  export let config: Config;
  export let path: string;

  let pageTitle = `${formatOrg(org, config)}/${urn}`;
  let projectInfo: Info | null = null;
  let projectRoot = proj.path({ urn, org, commit });
  let getProject = new Promise<Profile | null>(resolve => {
    if (org) {
      Org.getProjectProfile(org, config).then(p => resolve(p));
    } else {
      resolve(null);
    }
  }).then(async (orgProfile) => {
    const seed = orgProfile?.seed;
    const cfg = seed ? config.withSeed(seed) : config;
    const info = await proj.getInfo(urn, cfg);

    projectInfo = info;

    return { project: info, config: cfg, org: orgProfile };
  });

  $: if (projectInfo) {
    if (projectInfo.meta.description) {
      pageTitle = `${formatOrg(org, config)}/${projectInfo.meta.name}: ${projectInfo.meta.description}`;
    } else {
      pageTitle = `${formatOrg(org, config)}/${projectInfo.meta.name}`;
    }
  }

  const back = () => window.history.back();
</script>

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
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  .title .divider {
    color: var(--color-foreground-subtle);
    margin: 0 0.5rem;
    font-weight: normal;
  }
  .org-avatar {
    display: inline-block;
    width: 2rem;
    height: 2rem;
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

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<main>
  {#await getProject}
    <header>
      <Loading center />
    </header>
  {:then result}
    <header>
      <div class="title bold">
        {#if result.org}
          <a class="org-avatar" title={result.org.nameOrAddress} href={`/orgs/${result.org.nameOrAddress}`}>
            <Avatar source={result.org.avatar || org}/>
          </a>
          <span class="divider">/</span>
        {/if}
        <Link to={projectRoot}>{result.project.meta.name}</Link>
      </div>
      <div class="urn">{urn}</div>
      <div class="description">{result.project.meta.description}</div>
    </header>
    <Browser {urn} org={result.org} {path}
      commit={commit || result.project.head}
      config={result.config} />
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
