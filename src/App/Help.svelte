<script lang="ts">
  import ExternalLink from "@app/components/ExternalLink.svelte";
  import KeyHint from "@app/components/KeyHint.svelte";

  export let hideShortcuts: boolean = false;
</script>

<style>
  .help {
    font-size: var(--font-size-small);
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .item {
    display: flex;
    justify-content: space-between;
    width: 100%;
    white-space: nowrap;
    gap: 2rem;
  }
  .divider {
    border-bottom: 1px solid var(--color-fill-separator);
  }
</style>

<div class="help">
  <div class="item">
    About
    <ExternalLink href="https://radicle.xyz">radicle.xyz</ExternalLink>
  </div>

  {#if !hideShortcuts}
    <div class="divider"></div>
    <div class="item">
      Keyboard shortcuts <KeyHint>?</KeyHint>
    </div>
  {/if}
</div>
