<script lang="ts">
  import IconSmall from "@app/components/IconSmall.svelte";

  export let commentCount: number;
</script>

<style>
  .comments {
    color: var(--color-foreground-dim);
    font-size: var(--font-size-tiny);
    display: flex;
    align-items: center;
    gap: 0.25rem;
    white-space: nowrap;
  }
</style>

<div class="comments">
  <IconSmall name="chat" />
  <span>{commentCount}</span>
</div>
