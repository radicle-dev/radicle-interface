<script lang="ts">
  import { Link } from 'svelte-routing';
  import type { Config } from '@app/config';
  import * as proj from '@app/project';
  import Loading from '@app/Loading.svelte';
  import Avatar from '@app/Avatar.svelte';
  import { Profile, ProfileType } from '@app/profile';
  import type { ProjectInfo } from '@app/project';
  import { formatProfile, formatSeedId, isRadicleId, setOpenGraphMetaTag } from '@app/utils';
  import { browserStore } from '@app/project';
  import { Seed } from '@app/base/seeds/Seed';

  import Header from '@app/base/projects/Header.svelte';
  import ProjectContentRoutes from '@app/base/projects/ProjectContentRoutes.svelte';
  import NotFound from '@app/NotFound.svelte';

  export let id: string; // Project name or URN.
  export let seedHost: string | null = null;
  export let profileName: string | null = null; // Address or name of parent profile.
  export let peer: string | null = null;
  export let config: Config;

  // Nb. Once we move the content routing above this component, this should
  // no longer be necessary, but right now, we have the project header that
  // is rendered before the routes are parsed, so we have to set this here.
  proj.browse({ peer });

  let parentName = profileName ? formatProfile(profileName, config) : null;
  let pageTitle = parentName ? `${parentName}/${id}` : id;
  let projectInfo: ProjectInfo | null = null;
  let getProject = new Promise<{ profile?: Profile | null; seed?: Seed } | null>((resolve, reject) => {
    if (profileName) {
      Profile.get(profileName, ProfileType.Project, config).then(p => resolve({ profile: p })).catch(err => reject(err.message));
    } else if (seedHost) {
      Seed.lookup(seedHost, config).then(s => resolve({ seed: s })).catch(err => reject(err.message));
    } else {
      resolve(null);
    }
  }).then(async (result): Promise<proj.Source> => {
    if (! result) {
      throw new Error("Couldn't load project");
    }

    const profile = result.profile;
    const seed = result.seed || profile?.seed;

    if (! seed?.valid) {
      throw new Error("Couldn't load project: invalid seed");
    }

    const info = await proj.getInfo(id, seed.api);
    const urn = isRadicleId(id) ? id : info.urn;
    const anchors = profile ? await profile.confirmedProjectAnchors(urn, config) : [];

    // Older versions of http-api don't include the URN.
    if (! info.urn) info.urn = urn;

    projectInfo = info;

    const peers: proj.PeerId[] = info.delegates
      ? await proj.getRemotes(urn, seed.api)
      : [];

    return { urn, seed, project: info, peers, profile, anchors };
  });

  function rootPath(source: proj.Source): string {
    return proj.pathTo({
      content: proj.ProjectContent.Tree,
      peer: null,
      path: "/",
      revision: null,
    }, source);
  }

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
        <Link to={rootPath(result)}>{result.project.name}</Link>
        {#if peer}
          <span class="divider" title={peer}>/ {formatSeedId(peer)}</span>
        {/if}
      </div>
      <div class="urn">{result.urn}</div>
      <div class="description">{result.project.description}</div>
    </header>

    <!-- TODO: Should reivision be null? -->
    {#await proj.getRoot(result.project, null, peer, result.seed.api) then { tree, branches, commit }}
      <Header {tree} {branches} {commit} {browserStore} source={result} peerSelector={!!seedHost} />
      <ProjectContentRoutes {tree} {peer} {branches} {browserStore} source={result} />
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
