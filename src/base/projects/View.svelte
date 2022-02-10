<script lang="ts">
  import { navigate, Link } from 'svelte-routing';
  import type { Config } from '@app/config';
  import * as proj from '@app/project';
  import Loading from '@app/Loading.svelte';
  import Avatar from '@app/Avatar.svelte';
  import { Profile, ProfileType } from '@app/profile';
  import type { ProjectInfo } from '@app/project';
  import { formatOrg, formatSeedId, isRadicleId, setOpenGraphMetaTag } from '@app/utils';
  import { Seed } from '@app/base/seeds/Seed';

  import Header from '@app/base/projects/Header.svelte';
  import ProjectContentRoutes from '@app/base/projects/ProjectContentRoutes.svelte';
  import NotFound from '@app/NotFound.svelte';
  import type { Host } from '@app/api';

  export let id: string; // Project name or URN.
  export let addressOrName = "";
  export let seedHost = "";
  export let peer = "";
  export let config: Config;

  let parentName = formatOrg(addressOrName, config);
  let pageTitle = parentName ? `${parentName}/${id}` : id;
  let projectInfo: ProjectInfo | null = null;
  let revision = "";
  let content: proj.ProjectContent;
  let path: string;
  let getProject = new Promise<{ profile?: Profile | null; seed?: Seed } | null>((resolve, reject) => {
    if (addressOrName) {
      Profile.get(addressOrName, ProfileType.Project, config).then(p => resolve({ profile: p })).catch(err => reject(err.message));
    } else if (seedHost) {
      Seed.lookup(seedHost, config).then(s => resolve({ seed: s })).catch(err => reject(err.message));
    } else {
      resolve(null);
    }
  }).then(async (result) => {
    if (! result) {
      throw new Error("Couldn't load project");
    }

    const profile = result.profile;
    const seed = result.seed || profile?.seed;

    if (! seed?.valid) {
      throw new Error("Couldn't load project: invalid seed");
    }

    const info = await proj.getInfo(id, seed.api);
    projectInfo = info;

    const urn = isRadicleId(id) ? id : info.urn;
    const anchors = profile ? await profile.confirmedProjectAnchors(urn, config) : [];

    let branches = Array([info.defaultBranch, info.head]) as [string, string][];
    let peers: proj.Peer[] = [];
    peers = await proj.getPeers(urn, seed.api);

    return { urn, addressOrName, seed, peer, project: info, branches, peers, profile, anchors };
  });

  $: if (projectInfo) {
    const baseName = parentName
      ? `${parentName}/${projectInfo.name}`
      : projectInfo.name;

    if (projectInfo.description) {
      pageTitle = `${baseName}: ${projectInfo.description}`;
    } else {
      pageTitle = baseName;
    }

    setOpenGraphMetaTag([
      { prop: "og:title", content: projectInfo.name },
      { prop: "og:description", content: projectInfo.description },
      { prop: "og:url", content: window.location.href }
    ]);
  }

  const getProjectSource = async (urn: string, peer: string, project: ProjectInfo, seedHost: Host): Promise<[proj.Tree, string]> => {
    revision = project.head;

    if (peer) {
      const query = await proj.getBranchesByPeer(urn, peer, seedHost);
      revision = query.heads[project.defaultBranch];
    }
    const tree = await proj.getTree(urn, revision, "/", seedHost);

    return [tree, revision];
  };

  function updateRouteParams({ detail: newParams }: { detail: { urn: string; path: string; revision?: string; peer: string; content?: proj.ProjectContent } }) {
    const routeParams: any = {
      addressOrName,
      seed: seedHost,
      urn: newParams.urn,
      peer: newParams.peer,
      path: newParams.path
    };

    if (newParams.revision) routeParams.revision = newParams.revision;
    if (newParams.content) routeParams.content = newParams.content;
    const newLocation = proj.path(routeParams);

    console.log(newLocation);

    if (newLocation !== window.location.pathname) {
      navigate(newLocation);
    }
    if (content !== newParams.content) content = newParams.content ?? proj.ProjectContent.Tree;
    if (revision !== newParams.revision) revision = newParams.revision ?? "";
    if (path !== newParams.path) path = newParams.path;
    if (peer !== newParams.peer) peer = newParams.peer;
  }
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
          <a class="org-avatar" title={result.profile.nameOrAddress} href="/{result.profile.nameOrAddress}">
            <Avatar source={result.profile.avatar || result.profile.address} address={result.profile.address}/>
          </a>
          <span class="divider">/</span>
        {/if}
        <Link to={proj.path({ urn: result.urn, addressOrName, seed: result.seed.host })}>{result.project.name}</Link>
        {#if peer}
          <span class="divider" title={peer}>/ {formatSeedId(peer)}</span>
        {/if}
      </div>
      <div class="urn">{result.urn}</div>
      <div class="description">{result.project.description}</div>
    </header>

    {#await getProjectSource(result.urn, peer, result.project, result.seed.api) then [tree, head]}
      <Header {tree} revision={head} {content} {path} {peer}
        source={result}
        peerSelector={!!seedHost}
        on:routeParamsChange={updateRouteParams} />
      <ProjectContentRoutes {tree} {peer} {head}
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
    <NotFound title={id} subtitle="This project was not found." />
  {/await}
</main>
