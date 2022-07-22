<script lang="ts">
  import Dropdown from "@app/Dropdown.svelte";
  import { PatchTab, Revision } from "@app/patch";
  import { formatCommit, formatTimestamp } from "@app/utils";
  import { createEventDispatcher } from "svelte";

  export let revisions: Revision[];
  export let revisionNumber: number;
  export let activeTab: PatchTab;

  const dispatch = createEventDispatcher();

  const formatRevisionName = (revision: Revision, index: number) => {
    return `R${index} ${formatCommit(revision.oid)} ${formatTimestamp(
      revision.timestamp
    )}`;
  };

  const revisionList = Object.values(revisions).map((b, i) => ({
    key: formatRevisionName(b, i),
    value: i.toString(),
    badge: null,
  }));

  const onRevisionChange = ({ detail }: { detail: string }) => {
    showSelector = false;
    dispatch("revisionChanged", detail);
  };

  let showSelector = false;
</script>

<style>
  .bar {
    background-color: var(--color-foreground-background);
    padding: 1rem;
    border-bottom: solid 1px var(--color-background);
  }
  .tabs {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    color: var(--color-foreground-80);
    width: 21rem;
  }
  .tab:hover {
    color: var(--color-foreground);
    cursor: pointer;
  }
  .active {
    color: var(--color-foreground);
    cursor: default !important;
  }
  .revision-toggle {
    color: var(--color-foreground-80);
    border: none;
    padding: 0;
  }
  .revision-toggle:hover {
    background: none;
  }
  .revision-toggle:disabled {
    color: var(--color-foreground-faded);
  }
</style>

<div class="bar text-small">
  <div class="tabs">
    <div
      class="tab" class:active={activeTab === PatchTab.Timeline}
      on:click={() => dispatch("switchTab", PatchTab.Timeline)}>
      Patch
    </div>
    <div>|</div>
    <div
      class="tab" class:active={activeTab === PatchTab.Diff}
      on:click={() => dispatch("switchTab", PatchTab.Diff)}>
      Changeset
    </div>
    <div>|</div>
    <div class="revision-toggle">
      <button
        class:tab={revisions.length > 1}
        class="text-small revision-toggle"
        disabled={revisions.length <= 1}
        on:click={() => showSelector = !showSelector}>
        {formatRevisionName(revisions[revisionNumber], revisionNumber)}
      </button>
      <Dropdown
        items={revisionList} selected={revisionNumber.toString()} visible={showSelector}
        on:select={onRevisionChange} />
    </div>
  </div>
</div>
