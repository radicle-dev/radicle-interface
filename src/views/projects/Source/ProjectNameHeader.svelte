<script lang="ts">
  import type { BaseUrl, Project } from "@http-client";

  import dompurify from "dompurify";
  import { markdownWithExtensions } from "@app/lib/markdown";
  import { twemoji } from "@app/lib/utils";

  import Badge from "@app/components/Badge.svelte";
  import CloneButton from "@app/views/projects/Header/CloneButton.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Id from "@app/components/Id.svelte";
  import Link from "@app/components/Link.svelte";
  import Share from "@app/views/projects/Share.svelte";

  export let project: Project;
  export let baseUrl: BaseUrl;

  function render(content: string): string {
    return dompurify.sanitize(
      markdownWithExtensions.parseInline(content) as string,
    );
  }
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
      </div>
    </div>
  </div>
  <div class="id">
    <Id shorten={false} id={project.id} ariaLabel="project-id" />
  </div>
</div>
<div class="description" use:twemoji>
  {render(project.description)}
</div>
