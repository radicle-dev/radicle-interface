<script lang="ts">
  import type { HttpdState } from "@app/lib/httpd";

  import { httpdStore } from "@app/lib/httpd";

  import Button from "@app/components/Button.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Popover from "@app/components/Popover.svelte";
  import Command from "@app/components/Command.svelte";

  const buttonTitle: Record<HttpdState["state"], string> = {
    stopped: "radicle-httpd is stopped",
    running: "radicle-httpd is running",
    authenticated: "radicle-httpd is running - signed in",
  };
</script>

<style>
  .label {
    display: block;
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-regular);
    margin-bottom: 0.75rem;
  }
</style>

{#if $httpdStore.state === "stopped"}
  <Popover
    popoverPositionTop="3rem"
    popoverPositionRight="0"
    popoverPositionLeft="-13rem">
    <Button
      slot="toggle"
      let:toggle
      on:click={toggle}
      title={buttonTitle[$httpdStore.state]}
      size="large"
      variant="outline">
      <IconSmall name="device" />
      Connect
    </Button>

    <svelte:fragment slot="popover">
      <div>
        <div class="label">
          Use the <a
            target="_blank"
            rel="noreferrer"
            href="https://radicle.xyz/#try"
            class="txt-link txt-bold">
            Radicle CLI
          </a>
          to connect your device.
        </div>
        <div class="label">
          Run the following command to start the httpd daemon.
        </div>
        <Command command="radicle-httpd" fullWidth />
      </div>
    </svelte:fragment>
  </Popover>
{:else}
  <Button title={buttonTitle[$httpdStore.state]} size="large" variant="primary">
    <IconSmall name="device" />
    Connected
  </Button>
{/if}
