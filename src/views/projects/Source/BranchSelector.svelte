<script lang="ts">
  import type { BaseUrl, Project } from "@httpd-client";
  import type { Route } from "@app/lib/router";

  import * as utils from "@app/lib/utils";
  import { closeFocused } from "@app/components/ModalToggle.svelte";

  import DropdownList from "@app/components/DropdownList.svelte";
  import DropdownListItem from "@app/components/DropdownList/DropdownListItem.svelte";
  import ModalToggle from "@app/components/ModalToggle.svelte";
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

  let expanded: boolean;
</script>

<style>
  .commit {
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-family-monospace);
    font-size: var(--font-size-small);
    overflow: hidden;
    border-radius: var(--border-radius-tiny);
  }
</style>

<div class="commit" title="Current branch">
  {#if selectedBranch}
    <ModalToggle disabled={hideDropdown} bind:expanded>
      <Button
        slot="toggle"
        square
        title="Change branch"
        disabled={hideDropdown}>
        <IconSmall name="branch" />
        {selectedBranch}
        <IconSmall name={expanded ? "chevron-up" : "chevron-down"} />
      </Button>

      <DropdownList slot="modal" items={branches}>
        <svelte:fragment slot="item" let:item>
          <Link route={item.route} on:afterNavigate={() => closeFocused()}>
            <DropdownListItem selected={item.name === selectedBranch}>
              {item.name}
            </DropdownListItem>
          </Link>
        </svelte:fragment>
      </DropdownList>
    </ModalToggle>
  {/if}

  <Button square variant="dim">
    <Link
      route={{
        resource: "project.commit",
        project: project.id,
        node,
        commit: selectedCommitId,
      }}>
      {selectedCommitShortId}
    </Link>
  </Button>
</div>
