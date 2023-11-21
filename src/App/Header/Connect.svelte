<script lang="ts">
  import type { HttpdState } from "@app/lib/httpd";

  import * as httpd from "@app/lib/httpd";
  import { closeFocused } from "@app/components/Popover.svelte";
  import { httpdStore } from "@app/lib/httpd";

  import Button from "@app/components/Button.svelte";
  import Command from "@app/components/Command.svelte";
  import ExternalLink from "@app/components/ExternalLink.svelte";
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
  .label {
    display: block;
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-regular);
    margin-bottom: 0.75rem;
  }
  .status {
    font-size: var(--font-size-tiny);
    color: var(--color-fill-gray);
    text-align: left;
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
      variant="primary-toggle-off">
      <IconSmall name="device" />
      Connect
    </Button>

    <div slot="popover" style:width="23rem">
      <div class="label">
        Use the
        <ExternalLink href="https://radicle.xyz/#try">Radicle CLI</ExternalLink>
        to connect your device.
      </div>
      <div class="label">
        Run the following command to start the httpd daemon.
      </div>
      <Command command="radicle-httpd" fullWidth />
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
      variant="primary-toggle-on">
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
