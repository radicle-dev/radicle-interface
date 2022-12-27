<script lang="ts">
  import { parseRadicleId, toClipboard, twemoji } from "@app/lib/utils";
  import Button from "@app/components/Button.svelte";

  export let id: string;

  let copied = false;

  function copy() {
    toClipboard(id).then(() => {
      copied = true;
      setTimeout(() => {
        copied = false;
      }, 1000);
    });
  }
</script>

<style>
  .id {
    display: inline-flex;
    font-size: var(--font-size-regular);
    line-height: 2rem;
    color: var(--color-foreground-6);
    vertical-align: middle;
  }
  .icon {
    width: 1rem;
    margin-right: 0.5rem;
  }
  .id > * {
    vertical-align: middle;
  }
</style>

<div class="layout-desktop">
  <div class="id">
    <span class="icon" use:twemoji>🌱</span>
    <span class="txt-faded">rad:</span>
    <span>{parseRadicleId(id)}</span>
  </div>
</div>
<div>
  <Button variant="foreground" size="small" disabled={copied} on:click={copy}>
    {#if copied}
      Copy ✓
    {:else}
      Copy
    {/if}
  </Button>
</div>
