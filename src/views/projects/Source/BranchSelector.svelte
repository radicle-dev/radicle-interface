<script lang="ts">
  import type { BaseUrl, Project } from "@httpd-client";
  import type { Route } from "@app/lib/router";

  import * as utils from "@app/lib/utils";
  import { activeUnloadedRouteStore } from "@app/lib/router";
  import { closeFocused } from "@app/components/Popover.svelte";

  import DropdownList from "@app/components/DropdownList.svelte";
  import DropdownListItem from "@app/components/DropdownList/DropdownListItem.svelte";
  import Popover from "@app/components/Popover.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Link from "@app/components/Link.svelte";
  import Button from "@app/components/Button.svelte";

  export let branches: Array<{ name: string; route: Route }>;
  export let node: BaseUrl;
  export let project: Project;
  export let selectedBranch: string | undefined;
  export let selectedCommitId: string;

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
    align-items: center;
    gap: 0.5rem;
  }
</style>

<div class="branch">
  {#if selectedBranch}
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
        styleBorderRadius="var(--border-radius-small) 0 0 var(--border-radius-small)"
        title="Change branch">
        <IconSmall name="branch" />
        <div class="identifier">{selectedBranch}</div>
        <IconSmall name={expanded ? "chevron-up" : "chevron-down"} />
      </Button>

      <DropdownList
        slot="popover"
        styleDropdownMinWidth="7.5rem"
        items={branches}>
        <svelte:fragment slot="item" let:item>
          <Link route={item.route} on:afterNavigate={() => closeFocused()}>
            <DropdownListItem selected={item.name === selectedBranch}>
              <div class="identifier">{item.name}</div>
            </DropdownListItem>
          </Link>
        </svelte:fragment>
        <svelte:fragment slot="empty">
          <Link
            route={$activeUnloadedRouteStore}
            on:afterNavigate={() => closeFocused()}>
            <DropdownListItem selected>
              <div class="identifier">{project.defaultBranch}</div>
            </DropdownListItem>
          </Link>
        </svelte:fragment>
      </DropdownList>
    </Popover>
  {/if}

  <Button
    title="Current HEAD"
    variant="not-selected"
    styleBorderRadius={selectedBranch
      ? "0 var(--border-radius-small) var(--border-radius-small) 0"
      : "var(--border-radius-small)"}>
    <Link
      route={{
        resource: "project.commit",
        project: project.id,
        node,
        commit: selectedCommitId,
      }}>
      <div class="identifier global-commit">
        {#if !selectedBranch}
          <IconSmall name="branch" />
        {/if}

        {selectedCommitShortId}
      </div>
    </Link>
  </Button>
</div>
