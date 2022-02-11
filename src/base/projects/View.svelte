<script lang="ts">
  import type { Config } from '@app/config';
  import * as proj from '@app/project';
  import Loading from '@app/Loading.svelte';
  import { Profile, ProfileType } from '@app/profile';
  import { isRadicleId } from '@app/utils';
  import { Seed } from '@app/base/seeds/Seed';
  import NotFound from '@app/NotFound.svelte';

  import Project from './Project.svelte';

  export let id: string; // Project name or URN.
  export let seedHost: string | null = null;
  export let profileName: string | null = null; // Address or name of parent profile.
  export let peer: string | null = null;
  export let config: Config;

  // Show peer selector only if we're browsing via a seed.
  const peerSelector = Boolean(seedHost);

  // Nb. Once we move the content routing above this component, this should
  // no longer be necessary, but right now, we have the project header that
  // is rendered before the routes are parsed, so we have to set this here.
  proj.browse({ peer });

  const getProject = async (): Promise<proj.Source> => {
    const profile = profileName ? await Profile.get(profileName, ProfileType.Project, config) : null;
    const seed = profile ? profile.seed : seedHost ? await Seed.lookup(seedHost, config) : null;

    if (!profile && !seed) {
      throw new Error("Couldn't load project");
    }
    if (! seed?.valid) {
      throw new Error("Couldn't load project: invalid seed");
    }

    const info = await proj.getInfo(id, seed.api);
    const urn = isRadicleId(id) ? id : info.urn;
    const anchors = profile ? await profile.confirmedProjectAnchors(urn, config) : [];

    // Older versions of http-api don't include the URN.
    if (! info.urn) info.urn = urn;

    const peers: proj.PeerId[] = info.delegates
      ? await proj.getRemotes(urn, seed.api)
      : [];

    return { urn, seed, project: info, peers, profile, anchors };
  };
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

  @media (max-width: 960px) {
    main > header {
      padding-left: 2rem;
    }
    main {
      padding-top: 2rem;
      min-width: 0;
    }
  }
</style>

<main>
  {#await getProject()}
    <header>
      <Loading center />
    </header>
  {:then source}
    <Project {source} {peer} {config} {peerSelector} />
  {:catch}
    <NotFound title={id} subtitle="This project was not found." />
  {/await}
</main>
