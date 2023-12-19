<script lang="ts">
  import type { HttpdState } from "@app/lib/httpd";

  import { httpdStore } from "@app/lib/httpd";

  import Authenticate from "./Header/Authenticate.svelte";
  import Breadcrumbs from "./Header/Breadcrumbs.svelte";
  import Button from "@app/components/Button.svelte";
  import Command from "@app/components/Command.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Link from "@app/components/Link.svelte";
  import NodeInfo from "@app/App/Header/NodeInfo.svelte";
  import Popover from "@app/components/Popover.svelte";

  const buttonTitle: Record<HttpdState["state"], string> = {
    stopped: "radicle-httpd is stopped",
    running: "radicle-httpd is running",
    authenticated: "radicle-httpd is running - signed in",
  };
</script>

<style>
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0;
    padding: 1rem;
  }
  .left,
  .right {
    display: flex;
    align-items: center;
    height: var(--button-regular-height);
    gap: 1rem;
  }

  .logo {
    height: var(--button-regular-height);
    margin-right: 0.5rem;
  }
  .label {
    display: block;
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-regular);
    margin-bottom: 0.75rem;
  }
  .connect-popover {
    max-width: 20rem;
  }
  .divider {
    height: 1px;
    width: 100%;
    background-color: var(--color-fill-separator);
    margin: 1rem 0;
  }
  .heading {
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-bold);
    margin-bottom: 0.5rem;
  }
  @media (max-width: 720px) {
    header .right {
      gap: 1rem;
    }
  }
</style>

<header>
  <div class="left">
    <Link route={{ resource: "home" }}>
      <img
        width="40"
        height="40"
        class="logo"
        alt="Radicle logo"
        src="/radicle.svg" />
    </Link>
    <div class="layout-desktop">
      <Breadcrumbs />
    </div>
  </div>

  <div class="right layout-desktop-flex">
    {#if $httpdStore.state === "stopped"}
      <Popover popoverPositionTop="3rem" popoverPositionRight="0">
        <Button
          slot="toggle"
          let:toggle
          on:click={toggle}
          title={buttonTitle[$httpdStore.state]}
          size="large"
          variant="secondary-toggle-off">
          <IconSmall name="device" />
          Connect
        </Button>
        <div slot="popover" class="connect-popover">
          <div class="heading">Connect & Authenticate</div>
          <div class="label">
            Start the local node to browse projecs on your local machine, create
            issues, and participate in discussions.
          </div>
          <Command fullWidth command={`rad web ${window.origin}`} />

          <div class="divider" />
          <div class="heading">New to Radicle?</div>
          <div class="label">
            Run the following command and follow the instructions to install
            Radicle and get started.
          </div>
          <Command
            fullWidth
            command="sh <(curl -sSf https://radicle.xyz/install)" />
        </div>
      </Popover>
    {:else}
      <NodeInfo running={$httpdStore.node === "running"} />
      <Authenticate />
    {/if}
  </div>
</header>
