<script lang="ts">
  import type { BaseUrl, DiffCopiedMovedChangeset } from "@httpd-client";

  import Badge from "@app/components/Badge.svelte";
  import Icon from "@app/components/Icon.svelte";
  import Link from "@app/components/Link.svelte";

  export let file: DiffCopiedMovedChangeset;
  export let revision: string;
  export let mode: "moved" | "copied";
  export let baseUrl: BaseUrl;
  export let projectId: string;
</script>

<style>
  .wrapper {
    border: 1px solid var(--color-foreground-4);
    border-radius: var(--border-radius-small);
    margin-bottom: 2rem;
    line-height: 1.5rem;
  }
  .header {
    align-items: center;
    background: none;
    border-radius: 0;
    display: flex;
    flex-direction: row;
    height: 3rem;
    padding: 1rem;
  }
  .actions {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1rem;
  }
  .browse {
    margin-left: auto;
    cursor: pointer;
  }
</style>

<div id={file.newPath} class="wrapper">
  <header class="header">
    <div class="actions">
      <p class="txt-regular">{file.oldPath} → {file.newPath}</p>
      {#if mode === "moved"}
        <Badge variant="foreground">moved</Badge>
      {:else if mode === "copied"}
        <Badge variant="foreground">copied</Badge>
      {/if}
    </div>
    <div class="browse" title="View file">
      <Link
        route={{
          resource: "projects",
          params: {
            id: projectId,
            baseUrl,
            view: { resource: "tree" },
            path: file.newPath,
            revision,
          },
        }}>
        <Icon name="browse" />
      </Link>
    </div>
  </header>
</div>
