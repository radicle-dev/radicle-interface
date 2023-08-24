<script lang="ts">
  export let active: boolean;
  export let name: string;
</script>

<style>
  .file {
    color: var(--color-foreground-6);
    border-radius: var(--border-radius-small);
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    line-height: 1.5em;
    margin: 0.125rem 0;
    padding: 0.25rem;
    width: 100%;
  }

  .file:hover {
    background-color: var(--color-fill-ghost);
  }

  .file.active {
    color: var(--color-foreground-match-background) !important;
    background-color: var(--color-fill-secondary);
  }

  .file.active:hover {
    color: var(--color-foreground-match-background) !important;
    background-color: var(--color-fill-secondary-hover);
  }

  .name {
    margin-left: 0.25rem;
    user-select: none;
    white-space: nowrap;
    text-overflow: ellipsis !important;
    overflow: hidden;
    max-width: 24ch;
  }
</style>

<div class="file" class:active>
  <span class="name">{name}</span>
</div>
