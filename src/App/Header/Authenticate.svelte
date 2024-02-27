<script lang="ts">
  import * as httpd from "@app/lib/httpd";
  import { closeFocused } from "@app/components/Popover.svelte";
  import { httpdStore } from "@app/lib/httpd";

  import Avatar from "@app/components/Avatar.svelte";
  import Button from "@app/components/Button.svelte";
  import IconButton from "@app/components/IconButton.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import NodeId from "@app/components/NodeId.svelte";
  import Popover from "@app/components/Popover.svelte";
  import ConnectInstructions from "@app/components/ConnectInstructions.svelte";
</script>

<style>
  .container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 18rem;
  }
  .status {
    font-size: var(--font-size-tiny);
    color: var(--color-fill-gray);
    text-align: left;
  }
  .peer-info {
    display: flex;
    align-items: center;
    font-family: var(--font-family-monospace);
  }
  .user {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }
  .connect-popover {
    max-width: 20rem;
  }
</style>

{#if $httpdStore.state === "authenticated"}
  <Popover popoverPositionTop="3rem" popoverPositionRight="0">
    <Button slot="toggle" let:toggle on:click={toggle} variant="naked-toggle">
      <div class="peer-info">
        <div style:height="1.25rem" style:margin-right="0.5rem">
          <Avatar nodeId={$httpdStore.session.publicKey} />
        </div>
        {$httpdStore.session.alias}
      </div>
    </Button>

    <div slot="popover" class="container">
      <div class="status">Authenticated as</div>
      <div class="user">
        <NodeId
          nodeId={$httpdStore.session.publicKey}
          alias={$httpdStore.session.alias} />
        <IconButton
          on:click={() => {
            void httpd.disconnect();
            closeFocused();
          }}>
          Disconnect
        </IconButton>
      </div>
    </div>
  </Popover>
{:else}
  <Popover popoverPositionTop="3rem" popoverPositionRight="0">
    <Button slot="toggle" let:toggle on:click={toggle} variant="naked-toggle">
      <IconSmall name="key" />
      Authenticate
    </Button>
    <div slot="popover" class="connect-popover">
      <ConnectInstructions />
    </div>
  </Popover>
{/if}
