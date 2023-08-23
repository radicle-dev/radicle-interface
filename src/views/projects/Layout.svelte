<script lang="ts">
  import type { ActiveTab } from "./Header.svelte";
  import type { BaseUrl, Project } from "@httpd-client";

  import dompurify from "dompurify";

  import markdown from "@app/lib/markdown";
  import { formatNodeId, twemoji } from "@app/lib/utils";

  import Clipboard from "@app/components/Clipboard.svelte";
  import Link from "@app/components/Link.svelte";

  import Header from "./Header.svelte";

  export let activeTab: ActiveTab = undefined;
  export let baseUrl: BaseUrl;
  export let peer: string | undefined = undefined;
  export let project: Project;

  const render = (content: string): string =>
    dompurify.sanitize(markdown.parse(content) as string);
</script>

<style>
  .container {
    width: 100%;
    padding: 4rem 8rem;
  }
  .header {
    width: 100%;
    max-width: var(--content-max-width);
    min-width: var(--content-min-width);
  }
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
  .truncate {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow-x: hidden;
  }
  .content {
    width: 100%;
    max-width: var(--content-max-width);
    min-width: var(--content-min-width);
    padding-bottom: 4rem;
  }

  @media (max-width: 960px) {
    .container {
      padding: 4rem 4rem;
    }
    .title {
      font-size: var(--font-size-medium);
      font-weight: var(--font-weight-bold);
      padding-right: 2rem;
    }
  }

  @media (max-width: 720px) {
    .container {
      padding: 4rem 1rem;
    }
  }
</style>

<div class="container">
  <div class="header">
    <div class="title">
      <span class="truncate">
        <Link
          route={{
            resource: "project.source",
            project: project.id,
            node: baseUrl,
          }}>
          <span class="project-name">
            {project.name}
          </span>
        </Link>
      </span>

      {#if peer}
        <span class="node-id">
          <span class="divider">/</span>
          <span title={peer}>{formatNodeId(peer)}</span>
          <Clipboard text={peer} />
        </span>
      {/if}
    </div>

    <div class="id">
      <span class="truncate">{project.id}</span>
      <Clipboard small text={project.id} />
    </div>

    <div class="description" use:twemoji>
      {@html render(project.description)}
    </div>

    <Header {project} {activeTab} {baseUrl} />
  </div>

  <div class="content">
    <slot />
  </div>
</div>
