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

  export let branches: Array<{ name: string; route: Route }>;
  export let node: BaseUrl;
  export let project: Project;
  export let selectedBranch: string | undefined;
  export let selectedCommitId: string;

  $: hideDropdown = branches.length <= 1;
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

<div class="branch" title="Current branch">
  {#if selectedBranch}
    <Popover
      popoverPadding="0"
      popoverPositionTop="2.5rem"
      popoverBorderRadius="var(--border-radius-small)">
      <Button
        variant="outline"
        let:expanded
        let:toggle
        on:click={toggle}
        slot="toggle"
        styleBorderRadius="var(--border-radius-tiny) 0 0 var(--border-radius-tiny)"
        title="Change branch"
        disabled={hideDropdown}>
        <IconSmall name="branch" />
        <div class="identifier">{selectedBranch}</div>
        <IconSmall name={expanded ? "chevron-up" : "chevron-down"} />
      </Button>

      <DropdownList slot="popover" items={branches}>
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

  <Button
    variant={selectedBranch ? "gray" : "outline"}
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
