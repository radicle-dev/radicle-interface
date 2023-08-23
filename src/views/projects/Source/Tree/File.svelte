<script lang="ts">
  import Icon from "@app/components/Icon.svelte";

  export let active: boolean;
  export let name: string;
</script>

<style>
  .file {
    color: var(--color-foreground-6);
    border-radius: var(--border-radius-small);
    cursor: pointer;
    display: flex;
    line-height: 1.5em;
    margin: 0.125rem 0;
    padding: 0.25rem;
    width: 100%;
  }

  .file:hover {
    background-color: var(--color-foreground-1);
  }

  .file.active {
    color: var(--color-foreground) !important;
    background-color: var(--color-foreground-1);
  }

  .name {
    margin-left: 0.25rem;
    user-select: none;
    white-space: nowrap;
    text-overflow: ellipsis !important;
    overflow: hidden;
    max-width: 24ch;
  }
  .icon-container {
    color: var(--color-foreground-5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>

<div class="file" class:active>
  <div class="icon-container">
    <Icon name="file" />
  </div>
  <span class="name">{name}</span>
</div>
