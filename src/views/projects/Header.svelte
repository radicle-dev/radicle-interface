<script lang="ts">
  import type { Project } from "@app/lib/project";
  import type {
    ProjectRoute,
    ProjectsParams,
    Route,
  } from "@app/lib/router/definitions";
  import type { Tree } from "@app/lib/project";

  import * as router from "@app/lib/router";
  import BranchSelector from "@app/views/projects/BranchSelector.svelte";
  import CloneButton from "@app/views/projects/CloneButton.svelte";
  import HeaderLabel from "@app/views/projects/HeaderLabel.svelte";
  import Link from "@app/components/Link.svelte";
  import PeerSelector from "@app/views/projects/PeerSelector.svelte";
  import ProjectLink from "@app/components/ProjectLink.svelte";
  import { closeFocused } from "@app/components/Floating.svelte";

  export let activeRoute: ProjectRoute;
  export let project: Project;
  export let tree: Tree;
  export let commit: string;

  const { id, peers, branches, seed } = project;

  $: revision = activeRoute.params.revision ?? commit;

  const contentRoute = (
    input: "patches" | "issues" | "history",
    resource: string,
    keepSourceInPath: boolean,
  ): ProjectsParams => ({
    view: {
      resource: resource === input ? "tree" : input,
    },
    id: project.id,
    revision: revision,
    search: undefined,
    ...(keepSourceInPath ? null : { revision: undefined, path: undefined }),
  });

  const updatePeer = (peer: string) => {
    router.updateProjectRoute({
      peer,
      revision: undefined,
    });
    closeFocused();
  };

  const updateRevision = (revision: string) => {
    router.updateProjectRoute({
      revision,
    });
    closeFocused();
  };

  const goToSeed: Route = seed.addr.port
    ? {
        resource: "seeds",
        params: { host: `${seed.addr.host}:${seed.addr.port}` },
      }
    : { resource: "seeds", params: { host: seed.addr.host } };
</script>

<style>
  header {
    font-size: var(--font-size-tiny);
    padding: 0 2rem 0 8rem;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    justify-content: left;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  @media (max-width: 960px) {
    header {
      padding-left: 2rem;
    }
    header {
      margin-bottom: 1.5rem;
    }
  }
</style>

<header>
  {#if peers.length > 0}
    <PeerSelector
      {peers}
      peer={activeRoute.params.peer}
      on:peerChanged={event => updatePeer(event.detail)} />
  {/if}

  <BranchSelector
    {branches}
    {project}
    {revision}
    on:branchChanged={event => updateRevision(event.detail)} />

  {#if window.HEARTWOOD && seed.addr.host}
    <CloneButton seedHost={seed.addr.host} {id} />
  {:else if seed.git.host}
    <CloneButton seedHost={seed.git.host} {id} />
  {/if}

  <span>
    {#if seed.addr.host}
      <Link route={goToSeed}>
        <HeaderLabel
          clickable
          ariaLabel="Seed"
          title="Project data is fetched from this seed">
          <span>{seed.addr.host}</span>
        </HeaderLabel>
      </Link>
    {/if}
  </span>
  <ProjectLink
    projectParams={contentRoute(
      "history",
      activeRoute.params.view.resource,
      true,
    )}>
    <HeaderLabel
      ariaLabel="Commit count"
      clickable
      active={activeRoute.params.view.resource === "history"}>
      <span class="txt-bold">{tree.stats.commits}</span>
      commit(s)
    </HeaderLabel>
  </ProjectLink>
  {#if project.issues}
    <ProjectLink
      projectParams={contentRoute(
        "issues",
        activeRoute.params.view.resource,
        false,
      )}>
      <HeaderLabel
        ariaLabel="Issue count"
        active={activeRoute.params.view.resource === "issues"}
        disabled={project.issues === 0}
        clickable={project.issues > 0}>
        <span class="txt-bold">{project.issues}</span>
        issue(s)
      </HeaderLabel>
    </ProjectLink>
  {/if}
  {#if project.patches}
    <ProjectLink
      projectParams={contentRoute(
        "patches",
        activeRoute.params.view.resource,
        false,
      )}>
      <HeaderLabel
        ariaLabel="Patch count"
        clickable={project.patches > 0}
        active={activeRoute.params.view.resource === "patches"}
        disabled={project.patches === 0}>
        <span class="txt-bold">{project.patches}</span>
        patch(es)
      </HeaderLabel>
    </ProjectLink>
  {/if}
  <HeaderLabel ariaLabel="Contributor count">
    <span class="txt-bold">{tree.stats.contributors}</span>
    contributor(s)
  </HeaderLabel>
</header>
