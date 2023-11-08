<script lang="ts" strictEvents>
  import type { Embed } from "@app/lib/file";

  import Badge from "@app/components/Badge.svelte";
  import Clipboard from "@app/components/Clipboard.svelte";

  export let embeds: Embed[] = [];
</script>

<style>
  .header {
    display: flex;
    gap: 1rem;
    align-items: center;
    font-size: var(--font-size-small);
    margin-bottom: 0.75rem;
  }
  .body {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    gap: 0.5rem;
    margin-bottom: 1.25rem;
  }
</style>

<div>
  <div class="header">
    <span>Attachments</span>
  </div>
  <div class="body">
    {#each embeds as embed}
      <Badge variant="neutral">
        <span class="txt-overflow">{embed.name}</span>
        <Clipboard text={`![${embed.name}](${embed.content.substring(4)})`} />
      </Badge>
    {:else}
      <div class="txt-missing">No attachments</div>
    {/each}
  </div>
</div>
