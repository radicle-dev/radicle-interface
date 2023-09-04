<script lang="ts" strictEvents>
  import Chip from "@app/components/Chip.svelte";
  import Clipboard from "@app/components/Clipboard.svelte";

  export let embeds: { name: string; content: string }[] = [];
</script>

<style>
  .header {
    display: flex;
    gap: 1rem;
    align-items: center;
    font-size: var(--font-size-small);
    margin-bottom: 0.75rem;
    color: var(--color-foreground-6);
  }
  .body {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    gap: 0.5rem;
    margin-bottom: 1.25rem;
  }

  .chip-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
  }
</style>

<div>
  <div class="header">
    <span>Attachments</span>
  </div>
  <div class="body">
    {#each embeds as embed}
      <Chip actionable>
        <div slot="content" aria-label="chip" class="chip-content">
          <span class="txt-overflow">{embed.name}</span>
        </div>
        <Clipboard
          slot="icon"
          text={`![${embed.name}](${embed.content.substring(4)})`}
          tiny />
      </Chip>
    {:else}
      <div class="txt-missing">No attachments</div>
    {/each}
  </div>
</div>
