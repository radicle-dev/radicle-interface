<script lang="ts">
  import Button from "@app/components/Button.svelte";
  import ExternalLink from "@app/components/ExternalLink.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Link from "@app/components/Link.svelte";
  import Popover from "@app/components/Popover.svelte";
  import RadworksLogo from "@app/components/RadworksLogo.svelte";
  import ThemeSettings from "./Header/ThemeSettings.svelte";
</script>

<style>
  .mobile-footer {
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 0.5rem;
    position: fixed;
    bottom: 0;
    z-index: 1;
    gap: 0.5rem;
    border-top: 1px solid var(--color-fill-separator);
    background-color: var(--color-background-default);
  }
  .divider {
    border-bottom: 1px solid var(--color-fill-separator);
    margin: 1.5rem 0;
  }
  .help {
    font-size: var(--font-size-small);
    color: var(--color-foreground-dim);
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  a:hover {
    color: var(--color-fill-secondary);
  }
  .help-item {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
</style>

<div class="mobile-footer">
  <Link
    style="width: 100%; display: flex; align-items: center; justify-content: center;"
    route={{ resource: "home" }}>
    <img
      width="16"
      height="16"
      class="logo"
      alt="Radicle logo"
      src="/radicle.svg" />
  </Link>

  <slot />

  <div style:width="100%">
    <Popover popoverPositionBottom="3rem" popoverPositionRight="0">
      <Button
        let:expanded
        slot="toggle"
        variant={expanded ? "secondary" : "secondary-mobile-toggle"}
        styleWidth="100%"
        let:toggle
        on:click={toggle}>
        <IconSmall name="menu" />
      </Button>

      <div slot="popover" style:width="18.5rem">
        <div class="help">
          <div class="help-item">
            Supported by
            <a
              class="logo"
              target="_blank"
              rel="noreferrer"
              href="https://radworks.org">
              <RadworksLogo />
            </a>
          </div>
          <div class="help-item">
            About
            <ExternalLink href="https://radicle.xyz">radicle.xyz</ExternalLink>
          </div>
        </div>
        <div class="divider" />
        <ThemeSettings />
      </div>
    </Popover>
  </div>
</div>
