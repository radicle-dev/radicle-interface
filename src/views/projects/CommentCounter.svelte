<script lang="ts">
  import Icon from "@app/components/Icon.svelte";

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
  <Icon name="chat" />
  <span>{commentCount}</span>
</div>
