<script lang="ts">
  import IconSmall from "@app/components/IconSmall.svelte";
  import { formatCommit } from "@app/lib/utils";

  export let name: string;
  export let oid: string;
</script>

<style>
  .file {
    border-radius: var(--border-radius-tiny);
    display: flex;
    line-height: 1.5em;
    margin: 0.25rem 0;
    padding: 0.25rem 0.875rem;
    width: 100%;
  }

  .name {
    margin-left: 0.25rem;
    user-select: none;
    white-space: nowrap;
    text-overflow: ellipsis !important;
    color: var(--color-foreground-dim);
    overflow: hidden;
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-medium);
  }
  .icon-container {
    color: var(--color-fill-secondary);
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 0.125rem;
  }
</style>

<div class="file">
  <div class="icon-container">
    <IconSmall name="link" />
  </div>
  <span class="name">{name} @ {formatCommit(oid)}</span>
</div>
