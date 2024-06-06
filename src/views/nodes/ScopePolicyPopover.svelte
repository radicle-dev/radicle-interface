<script lang="ts">
  import type { Policy, Scope } from "@http-client";

  import capitalize from "lodash/capitalize";

  import IconSmall from "@app/components/IconSmall.svelte";
  import ScopePolicyExplainer from "@app/components/ScopePolicyExplainer.svelte";
  import IconButton from "@app/components/IconButton.svelte";
  import Popover from "@app/components/Popover.svelte";

  export let policy: Policy;
  export let scope: Scope;
  export let popoverPositionRight: string | undefined = undefined;
  export let popoverPositionLeft: string | undefined = undefined;
</script>

<style>
  .container {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  .separator {
    width: 1px;
    background-color: var(--color-fill-separator);
    display: flex;
    height: 1rem;
  }
  .popover {
    width: 18rem;
    color: var(--color-foreground-contrast);
  }
</style>

<div class="container">
  <span>
    Seeding Policy: <span class="txt-semibold">
      {capitalize(policy)}
    </span>
  </span>
  <span class="separator" />
  <span>
    Scope:
    <span class="txt-semibold">{capitalize(scope)}</span>
  </span>
  <span style:color="var(--color-fill-gray)">
    <Popover
      {popoverPositionRight}
      {popoverPositionLeft}
      popoverPositionBottom="2.5rem">
      <IconButton slot="toggle" let:toggle on:click={toggle}>
        <span style:color="var(--color-fill-gray)">
          <IconSmall name="info" />
        </span>
      </IconButton>

      <div slot="popover" class="popover">
        <ScopePolicyExplainer {scope} {policy} />
      </div>
    </Popover>
  </span>
</div>
