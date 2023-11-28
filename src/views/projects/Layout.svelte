<script lang="ts">
  import type { ActiveTab } from "./Header.svelte";
  import type { BaseUrl, Project } from "@httpd-client";

  import dompurify from "dompurify";

  import capitalize from "lodash/capitalize";
  import markdown from "@app/lib/markdown";
  import { twemoji } from "@app/lib/utils";

  import Badge from "@app/components/Badge.svelte";
  import CloneButton from "@app/views/projects/Header/CloneButton.svelte";
  import CopyableId from "@app/components/CopyableId.svelte";
  import Header from "@app/views/projects/Header.svelte";
  import Link from "@app/components/Link.svelte";
  import TrackButton from "@app/views/projects/Header/TrackButton.svelte";

  export let activeTab: ActiveTab = undefined;
  export let baseUrl: BaseUrl;
  export let project: Project;
  export let tracking: boolean;

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
    gap: 0.5rem;
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
  .description :global(a) {
    border-bottom: 1px solid var(--color-foreground-contrast);
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
    <span class="txt-overflow">
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
    {#if project.visibility && project.visibility.type === "private"}
      <Badge variant="caution" size="tiny">
        {capitalize(project.visibility.type)}
      </Badge>
    {/if}

    <div
      class="layout-desktop-flex"
      style="margin-left: auto; display: flex; gap: 0.5rem;">
      <TrackButton
        {tracking}
        trackings={project.trackings}
        projectId={project.id} />
      <CloneButton {baseUrl} id={project.id} name={project.name} />
    </div>
  </div>

  <div class="description" use:twemoji>
    {@html render(project.description)}
  </div>

  <div style:margin-bottom="3rem">
    <CopyableId id={project.id} />
  </div>

  <Header {project} {activeTab} {baseUrl} />
  <slot name="subheader" />
</div>

<div class="content">
  <slot />
</div>
