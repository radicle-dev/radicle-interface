<script lang="ts">
  import ExternalLink from "@app/components/ExternalLink.svelte";
  import KeyHint from "@app/components/KeyHint.svelte";
  import RadworksLogo from "@app/components/RadworksLogo.svelte";

  export let hideShortcuts: boolean = false;
</script>

<style>
  .help {
    width: 18.5rem;
    font-size: var(--font-size-small);
    color: var(--color-foreground-dim);
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .item {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
  .divider {
    border-bottom: 1px solid var(--color-fill-separator);
  }
  .logo {
    color: var(--color-foreground-contrast);
  }
  .logo:hover {
    color: var(--color-fill-secondary);
  }
</style>

<div class="help">
  <div class="item">
    Supported by
    <a
      class="logo"
      target="_blank"
      rel="noreferrer"
      href="https://radworks.org">
      <RadworksLogo />
    </a>
  </div>
  <div class="item">
    About
    <ExternalLink href="https://radicle.xyz">radicle.xyz</ExternalLink>
  </div>

  {#if !hideShortcuts}
    <div class="divider" />
    <div class="item">
      Keyboard shortcuts <KeyHint>?</KeyHint>
    </div>
  {/if}
</div>
