<script lang="ts">
  import type { BaseUrl, Project } from "@httpd-client";
  import type { Route } from "@app/lib/router";

  import * as utils from "@app/lib/utils";
  import { closeFocused } from "@app/components/Popover.svelte";

  import DropdownList from "@app/components/DropdownList.svelte";
  import DropdownListItem from "@app/components/DropdownList/DropdownListItem.svelte";
  import Popover from "@app/components/Popover.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Link from "@app/components/Link.svelte";
  import Button from "@app/components/Button.svelte";
  import HoverPopover from "@app/components/HoverPopover.svelte";

  export let branches: Array<{ name: string; route: Route }>;
  export let node: BaseUrl;
  export let project: Project;
  export let selectedBranch: string | undefined;
  export let selectedCommitId: string;

  $: onCanonicalBranch = branches.length === 0;
  $: selectedCommitShortId = utils.formatCommit(selectedCommitId);
</script>

<style>
  .branch {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .identifier {
    display: flex;
    gap: 0.5rem;
  }
</style>

<div class="branch">
  {#if selectedBranch}
    {#if onCanonicalBranch}
      <HoverPopover
        stylePopoverPositionLeft="0"
        stylePopoverPositionTop="0.5rem">
        <Button
          ariaLabel="canonical-branch"
          variant="gray-white"
          styleBorderRadius="var(--border-radius-tiny) 0 0 var(--border-radius-tiny)"
          slot="toggle"
          disabled
          notAllowed={false}>
          <IconSmall name="branch" />
          <div class="identifier">{project.defaultBranch}</div>
        </Button>
        <div class="txt-small" slot="popover">
          <div style:margin-bottom="1rem">
            You are currently browsing the canonical branch.
          </div>
          <div>If you want to browse a specific branch,</div>
          <div>you need to select the desired remote first.</div>
        </div>
      </HoverPopover>
    {:else}
      <Popover
        popoverPadding="0"
        popoverPositionTop="2.5rem"
        popoverBorderRadius="var(--border-radius-small)">
        <Button
          variant="gray-white"
          let:expanded
          let:toggle
          on:click={toggle}
          slot="toggle"
          styleBorderRadius="var(--border-radius-tiny) 0 0 var(--border-radius-tiny)"
          title="Change branch">
          <IconSmall name="branch" />
          <div class="identifier">{selectedBranch}</div>
          {#if !onCanonicalBranch}
            <IconSmall name={expanded ? "chevron-up" : "chevron-down"} />
          {/if}
        </Button>

        <DropdownList
          slot="popover"
          styleDropdownMinWidth="12.5rem"
          items={branches}>
          <svelte:fragment slot="item" let:item>
            <Link route={item.route} on:afterNavigate={() => closeFocused()}>
              <DropdownListItem selected={item.name === selectedBranch}>
                <div class="identifier">{item.name}</div>
              </DropdownListItem>
            </Link>
          </svelte:fragment>
        </DropdownList>
      </Popover>
    {/if}
  {/if}

  <Button
    title="Current HEAD"
    variant="not-selected"
    styleBorderRadius={selectedBranch
      ? "0 var(--border-radius-tiny) var(--border-radius-tiny) 0"
      : "var(--border-radius-tiny)"}>
    <Link
      route={{
        resource: "project.commit",
        project: project.id,
        node,
        commit: selectedCommitId,
      }}>
      <div
        class="identifier global-hash"
        style:font-weight="var(--font-weight-bold)">
        {#if !selectedBranch}
          <IconSmall name="branch" />
        {/if}

        {selectedCommitShortId}
      </div>
    </Link>
  </Button>
</div>
