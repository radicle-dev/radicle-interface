<script lang="ts">
  import type { Config } from "@app/config";
  import { Route } from "tinro";
  import { Project, ProjectContent } from "@app/project";
  import Loading from "@app/Loading.svelte";
  import NotFound from "@app/NotFound.svelte";

  import ProjectRoute from "./ProjectRoute.svelte";

  export let id: string; // Project name or URN.
  export let seedHost: string | null = null;
  export let profileName: string | null = null; // Address or name of parent profile.
  export let peer: string | null = null;
  export let config: Config;
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
  {#await Project.get(id, peer, profileName, seedHost, config)}
    <header>
      <Loading center />
    </header>
  {:then project}
    <!-- The default action is to render Browser with the default branch head -->
    <Route path="/">
      <ProjectRoute content={ProjectContent.Tree} {peer} {project} {config} />
    </Route>

    <Route path="/tree/*" firstmatch>
      <Route path="/">
        <ProjectRoute content={ProjectContent.Tree} {peer} {project} {config} />
      </Route>

      <Route path="/*" let:meta>
        <ProjectRoute
          route={meta.params["*"]}
          content={ProjectContent.Tree}
          {peer}
          {project}
          {config} />
      </Route>
    </Route>

    <Route path="/history/*" firstmatch>
      <Route path="/">
        <ProjectRoute
          content={ProjectContent.History}
          {peer}
          {project}
          {config} />
      </Route>
      <Route path="/*" let:meta>
        <ProjectRoute
          route={meta.params["*"]}
          content={ProjectContent.History}
          {peer}
          {project}
          {config} />
      </Route>
    </Route>

    <Route path="/commits/*" firstmatch>
      <Route path="/:commit" let:meta>
        <ProjectRoute
          revision={meta.params.commit}
          content={ProjectContent.Commit}
          {peer}
          {project}
          {config} />
      </Route>

      <Route path="/*" let:meta>
        <ProjectRoute
          route={meta.params["*"]}
          content={ProjectContent.Commit}
          {peer}
          {project}
          {config} />
      </Route>
    </Route>

    <Route path="/issues/*" firstmatch>
      <Route path="/">
        <ProjectRoute
          content={ProjectContent.Issues}
          {peer}
          {project}
          {config} />
      </Route>
      <Route path="/:issue" let:meta>
        <ProjectRoute
          content={ProjectContent.Issue}
          issue={meta.params.issue}
          {peer}
          {project}
          {config} />
      </Route>
    </Route>

    <Route path="/patches/*" firstmatch>
      <Route path="/">
        <ProjectRoute
          content={ProjectContent.Patches}
          {peer}
          {project}
          {config} />
      </Route>
      <Route path="/:patch" let:meta>
        <ProjectRoute
          content={ProjectContent.Patch}
          patch={meta.params.patch}
          {peer}
          {project}
          {config} />
      </Route>
    </Route>
  {:catch}
    <NotFound title={id} subtitle="This project was not found." />
  {/await}
</main>
