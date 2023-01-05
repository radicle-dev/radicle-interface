<script lang="ts">
  import type { PeerId, Project } from "@app/lib/project";

  import Avatar from "@app/components/Avatar.svelte";
  import Clipboard from "@app/components/Clipboard.svelte";
  import DOMPurify from "dompurify";
  import Link from "@app/components/Link.svelte";
  import ProjectLink from "@app/components/ProjectLink.svelte";
  import { formatSeedId } from "@app/lib/utils";

  export let project: Project;
  export let peer: PeerId | null = null;

  const linkifyDescription = (text: string) => {
    return text.replaceAll(/(https?:\/\/[^\s]+)/g, `<a href="$1">$1</a>`);
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
  .id {
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

  .description :global(a) {
    border-bottom: 1px solid var(--color-foreground-6);
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
      <Link
        route={{
          resource: "profile",
          params: { addressOrName: project.profile.addressOrName },
        }}
        title={project.profile.addressOrName}>
        <span class="org-avatar">
          <Avatar
            source={project.profile.avatar || project.profile.address}
            title={project.profile.address} />
        </span>
      </Link>
      <span class="divider">/</span>
    {/if}
    <span class="truncate">
      <ProjectLink
        projectParams={{
          view: { resource: "tree" },
          path: "/",
          peer: undefined,
          route: undefined,
          revision: undefined,
        }}>
        <span class="project-name">
          {project.name}
        </span>
      </ProjectLink>
    </span>
    {#if peer}
      <span class="peer-id">
        <span class="divider">/</span>
        <span title={peer}>{formatSeedId(peer)}</span>
        <Clipboard text={peer} />
      </span>
    {/if}
  </div>
  <div class="id">
    <span class="truncate">{project.id}</span>
    <Clipboard small text={project.id} />
  </div>
  <div class="description">
    {@html DOMPurify.sanitize(linkifyDescription(project.description))}
  </div>
</header>
