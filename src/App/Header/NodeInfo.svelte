<script lang="ts">
  import type { HttpdNodeState } from "@app/lib/httpd";

  import { capitalize } from "lodash";

  import Button from "@app/components/Button.svelte";
  import Command from "@app/components/Command.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Popover from "@app/components/Popover.svelte";
  import ScopePolicyExplainer from "@app/components/ScopePolicyExplainer.svelte";

  export let node: HttpdNodeState;
</script>

<style>
  .label {
    display: block;
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-regular);
    margin-bottom: 0.75rem;
  }
  .scope-policy {
    padding: 1rem 0;
    border-top: 1px solid var(--color-fill-separator);
    border-bottom: 1px solid var(--color-fill-separator);
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-regular);
    margin-bottom: 1rem;
  }
</style>

<Popover popoverPositionTop="2.5rem" popoverPositionRight="0">
  <Button slot="toggle" let:toggle on:click={toggle} variant={"naked-toggle"}>
    {#if node.state === "running"}
      <IconSmall name="online" />
      Online
    {:else}
      <IconSmall name="offline" />
      Offline
    {/if}
  </Button>

  <div slot="popover" style:width="18rem">
    {#if node.state === "running"}
      <div class="label">
        Your node is running and syncing with the network.
      </div>

      {#if node.seedingPolicy}
        <div class="scope-policy">
          <div style:display="flex">
            Seeding Policy: <span style:margin-left="auto" class="txt-semibold">
              {capitalize(node.seedingPolicy.default)}
            </span>
          </div>
          {#if node.seedingPolicy.default === "allow"}
            <div style:display="flex" style:margin-bottom="1rem">
              Scope:
              <span style:margin-left="auto" class="txt-semibold">
                {capitalize(node.seedingPolicy.scope)}
              </span>
            </div>
          {/if}

          <ScopePolicyExplainer seedingPolicy={node.seedingPolicy} />
        </div>
      {/if}
      <div class="label">
        Shut down your node if you want to stop sharing and receiving updates.
      </div>
      <Command command="rad node stop" fullWidth />
    {:else}
      <div class="label">Your node is not running.</div>
      <div class="label">
        Start your node to seed, clone or share your changes.
      </div>
      <Command command="rad node start" fullWidth />
    {/if}
  </div>
</Popover>
