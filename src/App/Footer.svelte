<script lang="ts">
  import IconButton from "@app/components/IconButton.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import KeyHint from "@app/components/KeyHint.svelte";
  import Popover from "@app/components/Popover.svelte";
  import RadworksLogo from "@app/components/RadworksLogo.svelte";
  import ThemeSettings from "./Header/ThemeSettings.svelte";
</script>

<style>
  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: var(--font-size-small);
    color: var(--color-foreground-dim);
    height: 2.25rem;
    background-color: var(--color-background-dip);
    padding: 1rem;
  }

  .left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .right {
    display: flex;
    gap: 1.5rem;
  }

  .logo {
    color: var(--color-foreground-contrast);
  }

  a {
    display: flex;
  }

  a:hover {
    color: var(--color-fill-secondary);
  }
</style>

<div class="footer">
  <div class="left">
    Supported by
    <a
      class="logo"
      target="_blank"
      rel="noreferrer"
      href="https://radworks.org">
      <RadworksLogo />
    </a>
  </div>

  <div class="center">
    Press <KeyHint>?</KeyHint>
    for keyboard shortcuts
  </div>
  <div class="right">
    <Popover popoverPositionBottom="2rem" popoverPositionRight="0">
      <IconButton slot="toggle" let:toggle on:click={toggle}>
        <IconSmall name="settings" />
        Settings
      </IconButton>

      <div slot="popover" style:width="19rem">
        <ThemeSettings />
      </div>
    </Popover>

    <a
      style:display="flex"
      style:align-items="center"
      style:gap="0.25rem"
      target="_blank"
      rel="noreferrer"
      href="https://radicle.xyz">
      radicle.xyz
      <IconSmall name="arrow-box-up-right" />
    </a>
  </div>
</div>
