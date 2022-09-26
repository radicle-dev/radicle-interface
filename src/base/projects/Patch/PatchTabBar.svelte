<script lang="ts">
  import type { ToggleButtonOption } from "@app/ToggleButton.svelte";

  import Dropdown from "@app/Dropdown.svelte";
  import Floating from "@app/Floating.svelte";
  import ToggleButton from "@app/ToggleButton.svelte";

  import type { Revision } from "@app/patch";
  import { PatchTab } from "@app/patch";
  import { formatCommit, formatTimestamp } from "@app/utils";
  import { createEventDispatcher } from "svelte";

  export let revisions: Revision[];
  export let revisionNumber: number;
  export let activeTab: PatchTab;

  const dispatch = createEventDispatcher();

  const formatRevisionName = (revision: Revision, index: number) => {
    return `R${index} ${formatCommit(revision.oid)} ${formatTimestamp(
      revision.timestamp,
    )}`;
  };

  const revisionList = Object.values(revisions).map((b, i) => ({
    key: formatRevisionName(b, i),
    value: i.toString(),
    title: `Browse revision ${formatRevisionName(b, i)}`,
    badge: null,
  }));

  const onRevisionChange = ({ detail }: { detail: string }) => {
    dispatch("revisionChanged", detail);
  };

  let options: ToggleButtonOption<PatchTab>[];
  $: options = [
    {
      title: "Patch",
      value: PatchTab.Timeline,
    },
    {
      title: "Changeset",
      value: PatchTab.Diff,
    },
  ];
</script>

<style>
  .bar {
    align-items: center;
    display: flex;
    gap: 1rem;
    margin: 1.5rem 0;
  }
  .revision-toggle {
    border-radius: var(--border-radius-small);
    border: none;
    color: var(--color-foreground-6);
    font-family: var(--font-family-monospace);
    font-size: var(--font-size-tiny);
    height: var(--button-tiny-height);
    padding: 0.25rem 0.5rem;
    background-color: var(--color-background);
  }
  .revision-toggle:hover {
    background-color: var(--color-foreground-1);
    color: var(--color-foreground);
  }
  .revision-toggle:disabled {
    color: var(--color-foreground-5);
  }
</style>

<div class="bar txt-small">
  <ToggleButton
    {options}
    on:select={e => {
      dispatch("switchTab", e.detail);
    }}
    active={activeTab} />

  <Floating disabled={revisions.length <= 1}>
    <button
      slot="toggle"
      class="txt-small revision-toggle"
      disabled={revisions.length <= 1}>
      {formatRevisionName(revisions[revisionNumber], revisionNumber)}
    </button>

    <svelte:fragment slot="modal">
      <Dropdown
        items={revisionList}
        selected={revisionNumber.toString()}
        on:select={onRevisionChange} />
    </svelte:fragment>
  </Floating>
</div>
