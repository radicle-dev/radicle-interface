<script lang="ts">
  import { navigate, Link } from 'svelte-routing';
  import type { Config } from '@app/config';
  import * as proj from '@app/project';
  import Loading from '@app/Loading.svelte';
  import Modal from '@app/Modal.svelte';
  import Avatar from '@app/Avatar.svelte';
  import { Profile, ProfileType } from '@app/profile';
  import type { Info } from '@app/project';
  import { formatOrg, formatSeedId } from '@app/utils';
  import { getOid } from '@app/project';
  import { Seed } from '@app/base/seeds/Seed';
  import { getAllAnchors } from '@app/anchors';

  import Header from '@app/base/projects/Header.svelte';
  import ProjectContentRoutes from '@app/base/projects/ProjectContentRoutes.svelte';

  export let urn: string;
  export let org = "";
  export let user = "";
  export let seed = "";
  export let peer = "";
  export let config: Config;

  let parentName = formatOrg(org || user, config);
  let pageTitle = parentName ? `${parentName}/${urn}` : urn;
  let projectInfo: Info | null = null;
  let revision: string;
  let content: proj.ProjectContent;
  let path: string;
  let getProject = new Promise<{ profile?: Profile; seed?: Seed } | null>(resolve => {
    if (org) {
      Profile.get(org, ProfileType.Project, config).then(p => resolve({ profile: p }));
    } else if (user) {
      Profile.get(user, ProfileType.Project, config).then(p => resolve({ profile: p }));
    } else if (seed) {
      Seed.get(config.withSeed({ host: seed })).then(s => resolve({ seed: s }));
    } else {
      resolve(null);
    }
  }).then(async (result) => {
    const profile = result?.profile;
    const seedInstance = profile?.seed ?? result?.seed;
    const cfg = seedInstance && seedInstance.valid ? config.withSeed(seedInstance) : config;
    const info = await proj.getInfo(urn, cfg);
    const anchors = await getAllAnchors(config, urn, profile?.anchorsAccount ?? org);

    let branches = Array([info.meta.defaultBranch, info.head]) as [string, string][];
    let peers: proj.Peer[] = [];

    projectInfo = info;

    // Checks for delegates returned from seed node, as feature check of the seed node
    if (info.meta.delegates) {
      // Check for selected peer to override available branches.
      if (peer) {
        const branchesByPeer = await proj.getBranchesByPeer(urn, peer || info.meta.delegates[0], cfg);
        branches = [...Object.entries(branchesByPeer.heads)];
      }
      peers = await proj.getPeers(urn, cfg);
    }
    return { urn, org, user, seed, peer, project: info, branches, peers, config: cfg, profile, anchors };
  });

  const parentUrl = (profile: Profile) => {
    return org
      ? `/orgs/${profile.nameOrAddress}`
      : `/users/${profile.nameOrAddress}`;
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

  function updateRouteParams({ detail: newParams }: { detail: { path: string; revision: string; peer: string; content: proj.ProjectContent } }) {
    let newLocation = proj.path({ urn, user, org, seed, content: newParams.content, peer: newParams.peer, revision: newParams.revision, path: newParams.path });
    if (newLocation !== window.location.pathname) {
      navigate(newLocation);
    }
    if (content !== newParams.content) content = newParams.content;
    if (revision !== newParams.revision) revision = newParams.revision;
    if (path !== newParams.path) path = newParams.path;
    if (peer !== newParams.peer) peer = newParams.peer;
  }

  const back = () => window.history.back();

  $: projectRoot = proj.path({ urn, user, org, seed });
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
    .description {
      font-size: 0.875rem;
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
        {#if peer}
          <span class="divider" title={peer}>/ {formatSeedId(peer)}</span>
        {/if}
      </div>
      <div class="urn">{urn}</div>
      <div class="description">{result.project.meta.description}</div>
    </header>
    {#await proj.getTree(urn, getOid(result.project.head, revision, result.branches), "/", config) then tree}
      <Header {tree} {revision} {content} {path}
        source={result}
        peerSelector={!!seed}
        on:routeParamsChange={updateRouteParams} />
      <ProjectContentRoutes {tree}
        source={result}
        bind:content={content}
        bind:revision={revision}
        bind:path={path} />
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
