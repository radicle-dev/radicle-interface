<script lang="ts">
  import { Link } from 'svelte-routing';
  import type { Config } from '@app/config';
  import * as proj from '@app/project';
  import Loading from '@app/Loading.svelte';
  import Modal from '@app/Modal.svelte';
  import Avatar from '@app/Avatar.svelte';
  import { Profile, ProfileType } from '@app/profile';
  import type { Info } from '@app/project';
  import { formatOrg } from '@app/utils';

  import Browser from './Browser.svelte';
  import Header from './Header.svelte';

  export let urn: string;
  export let org = "";
  export let user = "";
  export let commit = "";
  export let config: Config;
  export let path: string;

  let parentName = formatOrg(org || user, config);
  let pageTitle = parentName ? `${parentName}/${urn}` : urn;
  let projectInfo: Info | null = null;
  let projectRoot = proj.path({ urn, user, org, commit });
  let getProject = new Promise<Profile | null>(resolve => {
    if (org) {
      Profile.get(org, ProfileType.Project, config).then(p => resolve(p));
    } else if (user) {
      Profile.get(user, ProfileType.Project, config).then(p => resolve(p));
    } else {
      resolve(null);
    }
  }).then(async (profile) => {
    const seed = profile?.seed;
    const cfg = seed ? config.withSeed(seed) : config;
    const info = await proj.getInfo(urn, cfg);

    projectInfo = info;

    return { project: info, config: cfg, profile };
  });

  const parentUrl = (profile: Profile) => {
    return org
      ? `/orgs/${profile.nameOrAddress}`
      : `/users/${profile.nameOrAddress}`;
  };

  const onCommitChange = ({ detail: newCommit }: { detail: string }): void => {
    commit = newCommit;
  };

  $: if (projectInfo) {
    const baseName = parentName
      ? `${parentName}/${projectInfo.meta.name}`
      : projectInfo.meta.name;

    if (projectInfo.meta.description) {
      pageTitle = `${baseName}: ${projectInfo.meta.description}`;
    } else {
      pageTitle = baseName;
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
    overflow-wrap: anywhere;
  }
  .description {
    margin: 1rem 0 1.5rem 0;
  }

  @media (max-width: 960px) {
    main > header {
      padding-left: 2rem;
    }
    main {
      padding-top: 2rem;
      min-width: 0;
    }
    .title {
      font-size: 1.5rem;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .org-avatar {
      display: inline-block;
      width: 1.5rem;
      height: 1.5rem;
    }
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
        {#if result.profile}
          <a class="org-avatar" title={result.profile.nameOrAddress} href={parentUrl(result.profile)}>
            <Avatar source={result.profile.avatar || result.profile.address} address={result.profile.address}/>
          </a>
          <span class="divider">/</span>
        {/if}
        <Link to={projectRoot}>{result.project.meta.name}</Link>
      </div>
      <div class="urn">{urn}</div>
      <div class="description">{result.project.meta.description}</div>
    </header>
    {#await proj.getTree(urn, commit, "/", config)}
      <!-- Loading -->
    {:then tree}
      <Header {urn} {tree}
        anchors={result.profile?.anchorsAccount ?? org}
        commit={commit || result.project.head}
        config={result.config}
        project={result.project}
        on:commitChange={onCommitChange}
      /> 
      <Browser {urn} {org} {user} {path} {tree}
        commit={commit || result.project.head}
        config={result.config} />
    {:catch err}
      <div class="container center-content">
        <div class="error error-message text-xsmall">
          <!-- TODO: Differentiate between (1) commit doesn't exist and (2) failed
               to fetch - this needs a change to the backend. -->
          API request to <code class="text-xsmall">{err.url}</code> failed
        </div>
      </div>
    {/await}
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
