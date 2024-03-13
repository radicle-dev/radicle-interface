<script lang="ts">
  import type { Policy, Scope } from "@httpd-client";

  import capitalize from "lodash/capitalize";

  import HoverPopover from "@app/components/HoverPopover.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import ScopePolicyExplainer from "@app/components/ScopePolicyExplainer.svelte";

  export let policy: Policy;
  export let scope: Scope;
  export let stylePopoverPositionRight: string | undefined = undefined;
  export let stylePopoverPositionLeft: string | undefined = undefined;
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
    <HoverPopover
      {stylePopoverPositionRight}
      {stylePopoverPositionLeft}
      stylePopoverPositionBottom="1.5rem">
      <div slot="toggle">
        <span style:color="var(--color-fill-gray)">
          <IconSmall name="info" />
        </span>
      </div>

      <div slot="popover" class="popover">
        <ScopePolicyExplainer {scope} {policy} />
      </div>
    </HoverPopover>
  </span>
</div>
