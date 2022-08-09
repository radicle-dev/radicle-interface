<script lang="ts">
  import Dropdown from "@app/Dropdown.svelte";
  import Floating from "@app/Floating.svelte";
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
    dispatch("revisionChanged", detail);
  };
</script>

<style>
  .bar {
    margin: 1rem 0;
  }
  .tabs {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1rem;
  }
  .tab {
    color: var(--color-foreground-80);
    border-radius: var(--border-radius-small);
    font-family: var(--font-family-monospace);
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }
  .tab:hover, .tab.active {
    color: var(--color-foreground);
    background-color: var(--color-foreground-background);
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
    <div
      class="tab" class:active={activeTab === PatchTab.Diff}
      on:click={() => dispatch("switchTab", PatchTab.Diff)}>
      Changeset
    </div>
    <div class="revision-toggle">
      <Floating disabled={revisions.length <= 1}>
        <button
          slot="toggle"
          class:tab={revisions.length > 1}
          class="text-small revision-toggle"
          disabled={revisions.length <= 1}>
          {formatRevisionName(revisions[revisionNumber], revisionNumber)}
        </button>
        <svelte:fragment slot="modal">
          <Dropdown
            items={revisionList} selected={revisionNumber.toString()}
            on:select={onRevisionChange} />
        </svelte:fragment>
      </Floating>
    </div>
  </div>
</div>
