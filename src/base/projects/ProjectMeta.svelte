<script lang="ts">
  import type { PeerId, Project } from "@app/project";

  import { link, routeToPath, activeRouteStore } from "@app/router";
  import Avatar from "@app/Avatar.svelte";
  import Clipboard from "@app/Clipboard.svelte";
  import { formatSeedId } from "@app/utils";
  import type { ProjectRoute, Route } from "@app/router/definitions";

  export let project: Project;
  export let peer: PeerId | null = null;

  const route = $activeRouteStore as ProjectRoute;
  const rootPath: Route = {
    type: "projects",
    params: {
      ...route.params,
      urn: project.urn,
      content: "tree",
      peer: null,
      path: "/",
      route: null,
      revision: null,
      issue: null,
      patch: null,
    },
  };
</script>

<style>
  .title {
    display: flex;
    align-items: center;
    justify-content: left;
    font-size: var(--font-size-huge);
    margin-bottom: 0.5rem;
  }
  .title .divider {
    color: var(--color-foreground-4);
    margin: 0 0.5rem;
    font-weight: var(--font-weight-normal);
  }
  .title .peer-id {
    color: var(--color-foreground-5);
    font-weight: var(--font-weight-normal);
    display: flex;
    align-items: center;
  }
  .org-avatar {
    display: inline-block;
    width: 2rem;
    height: 2rem;
  }
  .project-name:hover {
    color: inherit;
  }
  .urn {
    font-family: var(--font-family-monospace);
    font-size: var(--font-size-tiny);
    color: var(--color-foreground-5);
    overflow-wrap: anywhere;
    display: flex;
    justify-content: left;
    align-items: center;
    gap: 0.125rem;
  }
  .description {
    margin: 1rem 0 1.5rem 0;
  }

  .content {
    padding: 0 2rem 0 8rem;
  }

  .truncate {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow-x: hidden;
  }

  @media (max-width: 960px) {
    .content {
      padding-left: 2rem;
    }
  }
</style>

<header class="content">
  <div class="title txt-bold txt-title">
    {#if project.profile}
      <a
        use:link
        class="org-avatar"
        title={project.profile.nameOrAddress}
        href="/{project.profile.nameOrAddress}">
        <Avatar
          source={project.profile.avatar || project.profile.address}
          title={project.profile.address} />
      </a>
      <span class="divider">/</span>
    {/if}
    <span class="truncate">
      <a use:link={rootPath} class="project-name" href={routeToPath(rootPath)}>
        {project.name}
      </a>
    </span>
    {#if peer}
      <span class="peer-id">
        <span class="divider">/</span>
        <span title={peer}>{formatSeedId(peer)}</span>
        <Clipboard text={peer} />
      </span>
    {/if}
  </div>
  <div class="urn">
    <span class="truncate">{project.urn}</span>
    <Clipboard small text={project.urn} />
  </div>
  <div class="description">{project.description}</div>
</header>
