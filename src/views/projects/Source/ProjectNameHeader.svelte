<script lang="ts">
  import type { BaseUrl, Project } from "@http-client";

  import { twemoji } from "@app/lib/utils";

  import Badge from "@app/components/Badge.svelte";
  import CloneButton from "@app/views/projects/Header/CloneButton.svelte";
  import CopyableId from "@app/components/CopyableId.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import InlineMarkdown from "@app/components/InlineMarkdown.svelte";
  import Link from "@app/components/Link.svelte";
  import SeedButton from "@app/views/projects/Header/SeedButton.svelte";
  import Share from "@app/views/projects/Share.svelte";

  export let project: Project;
  export let baseUrl: BaseUrl;
  export let seeding: boolean;
</script>

<style>
  .title {
    align-items: center;
    gap: 0.5rem;
    color: var(--color-foreground-contrast);
    display: flex;
    font-size: var(--font-size-large);
    justify-content: left;
    text-align: left;
    text-overflow: ellipsis;
    padding: 1rem 1rem 0 1rem;
  }
  .description {
    padding: 0 1rem 1rem 1rem;
  }
  .project-name {
    font-weight: var(--font-weight-semibold);
  }
  .project-name:hover {
    color: inherit;
  }
  .description :global(a) {
    border-bottom: 1px solid var(--color-foreground-dim);
  }
  .description :global(a:hover) {
    border-bottom: 1px solid var(--color-foreground-contrast);
  }
  .id {
    padding-left: 1rem;
  }
  .title-container {
    display: flex;
    flex-direction: column;
    gap: 0rem;
    margin-bottom: 1rem;
  }
</style>

<div class="title-container">
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
      <Badge variant="yellow" size="tiny">
        <IconSmall name="lock" />
        Private
      </Badge>
    {/if}
    <div style="margin-left: auto; display: flex; gap: 0.5rem;">
      <Share {baseUrl} />
      <div
        style:display="flex"
        style:gap="0.5rem"
        class="global-hide-on-mobile-down">
        <CloneButton {baseUrl} id={project.id} name={project.name} />
        <SeedButton
          {seeding}
          seedCount={project.seeding}
          projectId={project.id} />
      </div>
    </div>
  </div>
  <div class="id">
    <CopyableId id={project.id} style="oid" />
  </div>
</div>
<div class="description" use:twemoji>
  <InlineMarkdown fontSize="regular" content={project.description} />
</div>
