<script lang="ts">
  import type { Config } from "@app/config";
  import type { Host } from "@app/api";
  import { Route, Router } from "svelte-routing";
  import { Project, ProjectContent } from "@app/project";
  import Loading from "@app/Loading.svelte";
  import NotFound from "@app/NotFound.svelte";

  import ProjectRoute from "./ProjectRoute.svelte";

  export let id: string; // Project name or URN.
  export let host: string | null = null;
  export let profileName: string | null = null; // Address or name of parent profile.
  export let peer: string | null = null;
  export let config: Config;

  let seedHost: Host | null = null;

  if (host) {
    if (host.split(":").length === 2) {
      const [h, p] = host.split(":");
      seedHost = { host: h, port: Number(p) };
    } else {
      seedHost = { host, port: null };
    }
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
    <Router>
      <!-- The default action is to render Browser with the default branch head -->
      <Route path="/">
        <ProjectRoute content={ProjectContent.Tree} {peer} {project} {config} />
      </Route>
      <Route path="/tree">
        <ProjectRoute content={ProjectContent.Tree} {peer} {project} {config} />
      </Route>
      <Route path="/tree/*" let:params let:location>
        <ProjectRoute
          route={params["*"]}
          content={ProjectContent.Tree}
          {location}
          {peer}
          {project}
          {config} />
      </Route>

      <Route path="/history">
        <ProjectRoute
          content={ProjectContent.History}
          {peer}
          {project}
          {config} />
      </Route>
      <Route path="/history/*" let:params let:location>
        <ProjectRoute
          route={params["*"]}
          content={ProjectContent.History}
          {location}
          {peer}
          {project}
          {config} />
      </Route>

      <Route path="/commits/:commit" let:params>
        <ProjectRoute
          revision={params.commit}
          content={ProjectContent.Commit}
          {peer}
          {project}
          {config} />
      </Route>
      <Route path="/commits/*" let:params let:location>
        <ProjectRoute
          route={params["*"]}
          content={ProjectContent.Commit}
          {location}
          {peer}
          {project}
          {config} />
      </Route>

      <Route path="/issues" let:location>
        <ProjectRoute
          content={ProjectContent.Issues}
          {peer}
          {project}
          {location}
          {config} />
      </Route>
      <Route path="/issues/:issue" let:params let:location>
        <ProjectRoute
          content={ProjectContent.Issue}
          issue={params.issue}
          {peer}
          {project}
          {location}
          {config} />
      </Route>

      <Route path="/patches">
        <ProjectRoute
          content={ProjectContent.Patches}
          {peer}
          {project}
          {config} />
      </Route>
      <Route path="/patches/:patch" let:params>
        <ProjectRoute
          content={ProjectContent.Patch}
          patch={params.patch}
          {peer}
          {project}
          {config} />
      </Route>
    </Router>
  {:catch}
    <NotFound title={id} subtitle="This project was not found." />
  {/await}
</main>
