<script lang="ts">
  import type { HttpdState } from "@app/lib/httpd";

  import * as httpd from "@app/lib/httpd";
  import * as modal from "@app/lib/modal";
  import { closeFocused } from "@app/components/Popover.svelte";
  import { httpdStore } from "@app/lib/httpd";

  import Button from "@app/components/Button.svelte";
  import ConnectModal from "@app/modals/ConnectModal.svelte";
  import Icon from "@app/components/Icon.svelte";
  import IconButton from "@app/components/IconButton.svelte";
  import Link from "@app/components/Link.svelte";
  import NodeId from "@app/components/NodeId.svelte";
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
    gap: 1.5rem;
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
  .separator {
    height: 1px;
    background-color: var(--color-border-hint);
  }
  .avatar {
    height: 1.5rem;
    color: var(--color-fill-secondary);
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
    font-weight: var(--font-weight-regular);
    font-family: var(--font-family-monospace);
  }
  .indicator {
    width: 0.75rem;
    height: 0.75rem;
    background-color: var(--color-fill-secondary);
    border-radius: var(--border-radius-round);
    position: absolute;
    top: -0.375rem;
    right: -0.375rem;
  }
  .row {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .user {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .identity {
    color: var(--color-fill-secondary);
    display: flex;
  }
</style>

{#if $httpdStore.state === "authenticated"}
  <Popover
    popoverPositionTop="3rem"
    popoverPositionRight="0"
    popoverWidth="25rem">
    <Button
      slot="toggle"
      let:toggle
      on:click={toggle}
      title={buttonTitle[$httpdStore.state]}
      size="large"
      variant="outline">
      <div class="avatar">
        <NodeId
          large
          disableTooltip
          nodeId={$httpdStore.session.publicKey}
          alias={$httpdStore.session.alias} />
      </div>
    </Button>

    <div slot="popover" class="container">
      <div class="row">
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

      <div class="separator" />

      <div class="row">
        <div class="status">Authenticated as</div>
        <div class="user">
          <div class="identity">
            <NodeId
              nodeId={$httpdStore.session.publicKey}
              alias={$httpdStore.session.alias} />
          </div>
          <IconButton
            on:click={() => {
              void httpd.disconnect();
              closeFocused();
            }}>
            Disconnect
          </IconButton>
        </div>
      </div>
    </div>
  </Popover>
{:else if $httpdStore.state === "running"}
  <Button
    on:click={() => {
      modal.show({
        component: ConnectModal,
        props: {},
      });
    }}
    title={buttonTitle[$httpdStore.state]}
    size="large"
    variant="outline">
    <Icon name="device" />
    Read only
    <div class="indicator" />
  </Button>
{:else}
  <Button
    on:click={() => {
      modal.show({
        component: ConnectModal,
        props: {},
      });
    }}
    title={buttonTitle[$httpdStore.state]}
    size="large"
    variant="secondary">
    <Icon name="device" />
    Connect
  </Button>
{/if}
