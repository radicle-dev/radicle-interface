<script lang="ts">
  import Button from "@app/Button.svelte";
  import { parseRadicleId, toClipboard } from "@app/utils";

  export let urn: string;

  let copied = false;

  function copy() {
    toClipboard(urn).then(() => {
      copied = true;
      setTimeout(() => {
        copied = false;
      }, 1000);
    });
  }
</script>

<style>
  .urn {
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
  .urn > * {
    vertical-align: middle;
  }
</style>

<div class="desktop">
  <div class="urn">
    <span class="icon">🌱</span>
    <span class="faded">rad:git:</span>
    <span>{parseRadicleId(urn)}</span>
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
