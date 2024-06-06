<script lang="ts">
  import type { BaseUrl, ChangesetWithoutDiff } from "@http-client";

  import Badge from "@app/components/Badge.svelte";
  import IconButton from "@app/components/IconButton.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Link from "@app/components/Link.svelte";
  import FilePath from "@app/components/FilePath.svelte";

  export let headerBadgeCaption: ChangesetWithoutDiff["state"];
  export let newPath: string;
  export let oldPath: string;
  export let revision: string | undefined = undefined;
  export let baseUrl: BaseUrl;
  export let projectId: string;
</script>

<style>
  .wrapper {
    border: 1px solid var(--color-border-default);
    border-radius: var(--border-radius-small);
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
</style>

<div id={newPath} class="wrapper">
  <header class="header">
    <div class="actions">
      <span>
        <FilePath filenameWithPath={oldPath} /> → <FilePath
          filenameWithPath={newPath} />
      </span>
      {#if headerBadgeCaption === "moved"}
        <Badge variant="foreground">moved</Badge>
      {:else if headerBadgeCaption === "copied"}
        <Badge variant="foreground">copied</Badge>
      {/if}
    </div>
    <div style:margin-left="auto">
      <Link
        route={{
          resource: "project.source",
          project: projectId,
          node: baseUrl,
          path: newPath,
          revision,
        }}>
        <IconButton title="View file at this commit">
          <IconSmall name="chevron-left-right" />
        </IconButton>
      </Link>
    </div>
  </header>
</div>
