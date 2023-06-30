<script lang="ts">
  import type { BaseUrl } from "@httpd-client";

  import Clipboard from "@app/components/Clipboard.svelte";
  import dompurify from "dompurify";
  import Link from "@app/components/Link.svelte";
  import { formatNodeId, twemoji } from "@app/lib/utils";

  export let baseUrl: BaseUrl;
  export let nodeId: string | undefined = undefined;
  export let projectDescription: string;
  export let projectId: string;
  export let projectName: string;

  const linkifyDescription = (text: string) => {
    return text.replaceAll(/(https?:\/\/[^\s]+)/g, `<a href="$1">$1</a>`);
  };
</script>

<style>
  .title {
    align-items: center;
    color: var(--color-secondary);
    display: flex;
    font-size: var(--font-size-x-large);
    font-weight: var(--font-weight-bold);
    justify-content: left;
    margin-bottom: 0.5rem;
    overflow-x: hidden;
    text-align: left;
    text-overflow: ellipsis;
  }
  .divider {
    color: var(--color-foreground-4);
    margin: 0 0.5rem;
    font-weight: var(--font-weight-normal);
  }
  .node-id {
    color: var(--color-foreground-5);
    font-weight: var(--font-weight-normal);
    display: flex;
    align-items: center;
    white-space: nowrap;
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
    .title {
      font-size: var(--font-size-medium);
      font-weight: var(--font-weight-bold);
    }
  }
</style>

<header class="content">
  <div class="title">
    <span class="truncate">
      <Link
        route={{
          resource: "projects",
          params: {
            id: projectId,
            baseUrl,
            view: { resource: "tree" },
            path: "/",
          },
        }}>
        <span class="project-name">
          {projectName}
        </span>
      </Link>
    </span>
    {#if nodeId}
      <span class="node-id">
        <span class="divider">/</span>
        <span title={nodeId}>{formatNodeId(nodeId)}</span>
        <Clipboard text={nodeId} />
      </span>
    {/if}
  </div>
  <div class="id">
    <span class="truncate">{projectId}</span>
    <Clipboard small text={projectId} />
  </div>
  <div class="description" use:twemoji>
    {@html dompurify.sanitize(linkifyDescription(projectDescription))}
  </div>
</header>
