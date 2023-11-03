<script lang="ts">
  import type { HttpdState } from "@app/lib/httpd";

  import * as httpd from "@app/lib/httpd";
  import { closeFocused } from "@app/components/Popover.svelte";
  import { httpdStore } from "@app/lib/httpd";

  import Button from "@app/components/Button.svelte";
  import Command from "@app/components/Command.svelte";
  import IconButton from "@app/components/IconButton.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Link from "@app/components/Link.svelte";
  import Popover from "@app/components/Popover.svelte";

  const buttonTitle: Record<HttpdState["state"], string> = {
    stopped: "radicle-httpd is stopped",
    running: "radicle-httpd is running",
    authenticated: "radicle-httpd is running - signed in",
  };
</script>

<style>
  .container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 18rem;
  }
  .host {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: var(--font-size-small);
  }
  .status {
    font-size: var(--font-size-tiny);
    color: var(--color-fill-gray);
    text-align: left;
  }
  .connect-popover {
    font-size: var(--font-size-small);
  }
</style>

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
      <div style:margin-bottom="1em">
        Start the backend to browse projecs on your local machine, create
        issues, and participate in discussions.
      </div>
      <Command fullWidth command={`rad-web ${window.origin}`} />
    </div>
  </Popover>
{:else}
  <Popover popoverPositionTop="3rem" popoverPositionRight="0">
    <Button
      slot="toggle"
      let:toggle
      on:click={toggle}
      title={buttonTitle[$httpdStore.state]}
      size="large"
      variant="secondary-toggle-on">
      <IconSmall name="device" />
      Connected
    </Button>

    <div slot="popover" class="container">
      <div class="status">Httpd server running</div>

      <div class="host">
        radicle.local

        <Link
          on:afterNavigate={closeFocused}
          route={{
            resource: "nodes",
            params: {
              baseUrl: httpd.api.baseUrl,
              projectPageIndex: 0,
            },
          }}>
          <IconButton>Browse</IconButton>
        </Link>
      </div>
    </div>
  </Popover>
{/if}
