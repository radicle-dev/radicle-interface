<script lang="ts">
  import type { Config } from '@app/config';
  import { Route, Router } from "svelte-routing";
  import * as proj from '@app/project';
  import Loading from '@app/Loading.svelte';
  import { Profile, ProfileType } from '@app/profile';
  import { isRadicleId } from '@app/utils';
  import { Seed } from '@app/base/seeds/Seed';
  import NotFound from '@app/NotFound.svelte';

  import ProjectRoute from "./ProjectRoute.svelte";

  export let id: string; // Project name or URN.
  export let seedHost: string | null = null;
  export let profileName: string | null = null; // Address or name of parent profile.
  export let peer: string | null = null;
  export let config: Config;

  const getProject = async (peer: string | null): Promise<proj.Source> => {
    const profile = profileName ? await Profile.get(profileName, ProfileType.Project, config) : null;
    const seed = profile ? profile.seed : seedHost ? await Seed.lookup(seedHost, config) : null;

    if (!profile && !seed) {
      throw new Error("Couldn't load project");
    }
    if (! seed?.valid) {
      throw new Error("Couldn't load project: invalid seed");
    }

    const project = await proj.getInfo(id, seed.api);
    const urn = isRadicleId(id) ? id : project.urn;
    const anchors = profile ? await profile.confirmedProjectAnchors(urn, config) : [];

    // Older versions of http-api don't include the URN.
    if (! project.urn) project.urn = urn;

    const peers: proj.PeerId[] = project.delegates
      ? await proj.getRemotes(urn, seed.api)
      : [];

    let remote: proj.Remote = {
      heads: { [project.defaultBranch]: project.head }
    };

    if (peer) {
      remote = await proj.getRemote(urn, peer, seed.api);
    }
    return { urn, seed, project, peers, branches: remote.heads, profile, anchors };
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
  {#await getProject(peer)}
    <header>
      <Loading center />
    </header>
  {:then source}
    <Router>
      <!-- The default action is to render Browser with the default branch head -->
      <Route path="/">
        <ProjectRoute content={proj.ProjectContent.Tree} {peer} {source} {config} />
      </Route>
      <Route path="/tree">
        <ProjectRoute content={proj.ProjectContent.Tree} {peer} {source} {config} />
      </Route>
      <Route path="/tree/*" let:params>
        <ProjectRoute route={params["*"]} content={proj.ProjectContent.Tree} {peer} {source} {config} />
      </Route>

      <Route path="/history">
        <ProjectRoute content={proj.ProjectContent.History} {peer} {source} {config} />
      </Route>
      <Route path="/history/*" let:params>
        <ProjectRoute route={params["*"]} content={proj.ProjectContent.History} {peer} {source} {config} />
      </Route>

      <Route path="/commits/:commit" let:params>
        <ProjectRoute revision={params.commit} content={proj.ProjectContent.Commit} {peer} {source} {config} />
      </Route>
      <Route path="/commits/*" let:params>
        <ProjectRoute route={params["*"]} content={proj.ProjectContent.Commit} {peer} {source} {config} />
      </Route>
    </Router>
  {:catch}
    <NotFound title={id} subtitle="This project was not found." />
  {/await}
</main>
