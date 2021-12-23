<script lang="ts">
  import { navigate, Link } from 'svelte-routing';
  import type { Config } from '@app/config';
  import * as proj from '@app/project';
  import Loading from '@app/Loading.svelte';
  import Modal from '@app/Modal.svelte';
  import Avatar from '@app/Avatar.svelte';
  import { Profile, ProfileType } from '@app/profile';
  import type { Info } from '@app/project';
  import { decodeRadicleId, formatOrg, formatProjectHash, querySubgraph } from '@app/utils';
  import { getOid } from '@app/project';
  import { ethers } from "ethers";

  import Header from '@app/base/projects/Header.svelte';
  import ProjectContentRoutes from '@app/base/projects/ProjectContentRoutes.svelte';

  export let urn: string;
  export let org = "";
  export let user = "";
  export let config: Config;

  let parentName = formatOrg(org || user, config);
  let pageTitle = parentName ? `${parentName}/${urn}` : urn;
  let projectInfo: Info | null = null;
  let revision: string;
  let content: proj.ProjectContent;
  let path: string;
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
    const anchors = await getAllAnchors(urn, profile?.anchorsAccount ?? org);

    // Checks for delegates returned from seed node, as feature check of the seed node
    if (info.meta.delegates) {
      const branches = await proj.getBranchesByPeer(urn, info.meta.delegates[0], cfg);
      return { project: info, branches: [...Object.entries(branches.heads)], peer: info.meta.delegates[0], anchors, config: cfg, profile };
    }
    return { project: info, branches: Array([info.meta.defaultBranch, info.head]) as [string, string][], anchors, config: cfg, profile };
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

  function updateRouteParams({ detail: newParams }: { detail: { path: string; revision: string; content: proj.ProjectContent } }) {
    let newLocation = proj.path({ urn, user, org, content: newParams.content, revision: newParams.revision, path: newParams.path });
    if (newLocation !== window.location.pathname) {
      navigate(newLocation);
    }
    if (content !== newParams.content) content = newParams.content;
    if (revision !== newParams.revision) revision = newParams.revision;
    if (path !== newParams.path) path = newParams.path;
  }

  const GetAllAnchors = `
    query GetAllAnchors($project: Bytes!, $org: ID!) {
      anchors(orderBy: timestamp, orderDirection: desc, where: { objectId: $project, org: $org }) {
        multihash
        timestamp
      }
    }
  `;

  interface AnchorObject {
    timestamp: number;
    multihash: string;
  }

  async function getAllAnchors(urn: string, anchors?: string | null): Promise<string[]> {
    if (! anchors) {
      return [];
    }
    const unpadded = decodeRadicleId(urn);
    const id = ethers.utils.hexZeroPad(unpadded, 32);
    const allAnchors = await querySubgraph(config.orgs.subgraph, GetAllAnchors, { project: id, org: anchors });
    return allAnchors.anchors
      .map((anchor: AnchorObject) => formatProjectHash(ethers.utils.arrayify(anchor.multihash)));
  }

  const back = () => window.history.back();
  // React to changes to the project commit. We have to manually
  // set the URL as well, to match the current commit.
  $: projectRoot = proj.path({ urn, user, org });
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
    {#await proj.getTree(urn, getOid(result.project.head, revision, result.branches), "/", config) then tree}
      <Header {urn} {tree} {revision} {content} {path}
        anchors={result.anchors}
        config={result.config}
        project={result.project}
        branches={result.branches}
        profile={result.profile}
        on:routeParamsChange={updateRouteParams} />
      <ProjectContentRoutes {urn} {org} {user} {tree}
        project={result.project}
        anchors={result.anchors}
        branches={result.branches}
        config={result.config}
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
