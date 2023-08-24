<script lang="ts">
  import type { ActiveTab } from "./Header.svelte";
  import type { BaseUrl, Project } from "@httpd-client";

  import dompurify from "dompurify";

  import markdown from "@app/lib/markdown";
  import { twemoji, isLocal } from "@app/lib/utils";

  import Clipboard from "@app/components/Clipboard.svelte";
  import CloneButton from "@app/views/projects/Header/CloneButton.svelte";
  import Link from "@app/components/Link.svelte";
  import Button from "@app/components/Button.svelte";

  import Header from "./Header.svelte";

  export let activeTab: ActiveTab = undefined;
  export let baseUrl: BaseUrl;
  export let project: Project;

  const render = (content: string): string =>
    dompurify.sanitize(markdown.parse(content) as string);
</script>

<style>
  .header {
    padding: 3rem 8rem 3rem 8rem;
    width: 100%;
    max-width: var(--content-max-width);
    min-width: var(--content-min-width);
  }
  .title {
    align-items: center;
    color: var(--color-foreground-contrast);
    display: flex;
    font-size: var(--font-size-x-large);
    font-weight: var(--font-weight-bold);
    justify-content: left;
    margin-bottom: 0.5rem;
    text-align: left;
    text-overflow: ellipsis;
  }
  .project-name:hover {
    color: inherit;
  }
  .id {
    color: var(--color-fill-secondary);
    overflow-wrap: anywhere;
    display: flex;
    justify-content: left;
    align-items: center;
    gap: 0.125rem;
    margin: 1rem 0 3rem 0;
  }
  .description :global(a) {
    border-bottom: 1px solid var(--color-foreground-contrast);
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
    padding: 0 8rem 4rem 8rem;
  }

  @media (max-width: 960px) {
    .header {
      padding: 4rem 1rem 3rem 1rem;
    }
    .content {
      padding: 0 1rem 4rem 1rem;
    }
    .title {
      font-size: var(--font-size-medium);
      font-weight: var(--font-weight-bold);
    }
  }

  @media (max-width: 720px) {
    .content {
      padding: 0 0 4rem 0;
    }
  }
</style>

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

    <div
      class="layout-desktop-flex"
      style="margin-left: auto; display: flex; gap: 0.5rem;">
      <Link
        route={{
          resource: "nodes",
          params: {
            baseUrl,
            projectPageIndex: 0,
          },
        }}>
        <Button size="large" variant="outline">
          {isLocal(baseUrl.hostname) ? "radicle.local" : baseUrl.hostname}
        </Button>
      </Link>

      <CloneButton {baseUrl} id={project.id} name={project.name} />
    </div>
  </div>

  <div class="description" use:twemoji>
    {@html render(project.description)}
  </div>

  <div class="id">
    <span class="truncate global-hash">{project.id}</span>
    <Clipboard small text={project.id} />
  </div>

  <Header {project} {activeTab} {baseUrl} />
  <slot name="subheader" />
</div>

<div class="content">
  <slot />
</div>
