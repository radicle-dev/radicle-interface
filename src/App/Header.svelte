<script lang="ts">
  import type { HttpdState } from "@app/lib/httpd";

  import { httpdStore } from "@app/lib/httpd";

  import Authenticate from "./Header/Authenticate.svelte";
  import Breadcrumbs from "./Header/Breadcrumbs.svelte";
  import Button from "@app/components/Button.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Link from "@app/components/Link.svelte";
  import NodeInfo from "@app/App/Header/NodeInfo.svelte";
  import Popover from "@app/components/Popover.svelte";
  import ConnectInstructions from "@app/components/ConnectInstructions.svelte";
  import { experimental } from "@app/lib/appearance";

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
    padding: 0.5rem 1rem;
    height: 3.5rem;
  }
  .left,
  .right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .logo {
    height: var(--button-regular-height);
    margin: 0 0.5rem;
  }
  .connect-popover {
    max-width: 20rem;
  }
</style>

<header>
  <div class="left">
    <Link
      style="display: flex; align-items: center;"
      route={{ resource: "home" }}>
      <img
        width="24"
        height="24"
        class="logo"
        alt="Radicle logo"
        src="/radicle.svg" />
    </Link>
    <Breadcrumbs />
  </div>

  <div class="right">
    {#if $experimental}
      {#if $httpdStore.state === "stopped"}
        <Popover popoverPositionTop="3rem" popoverPositionRight="0">
          <Button
            slot="toggle"
            let:toggle
            on:click={toggle}
            title={buttonTitle[$httpdStore.state]}
            variant="naked-toggle">
            <IconSmall name="device" />
            Connect
          </Button>
          <div slot="popover" class="connect-popover">
            <ConnectInstructions />
          </div>
        </Popover>
      {:else}
        <NodeInfo node={$httpdStore.node} />
        <Authenticate />
      {/if}
    {/if}
  </div>
</header>
