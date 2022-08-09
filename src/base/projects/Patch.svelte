<script lang="ts">
  import type { Config } from "@app/config";
  import { Project, ProjectContent } from "@app/project";
  import { capitalize } from "@app/utils";
  import { Patch, PatchTab } from "@app/patch";
  import { formatObjectId } from "@app/cobs";
  import Authorship from "@app/Authorship.svelte";

  import Changeset from "./SourceBrowser/Changeset.svelte";
  import PatchSideBar from "./Patch/PatchSideBar.svelte";
  import PatchTabBar from "./Patch/PatchTabBar.svelte";
  import PatchTimeline from "./Patch/PatchTimeline.svelte";
  import Placeholder from "@app/Placeholder.svelte";

  export let patch: Patch;
  export let project: Project;
  export let config: Config;

  const onSwitch = ({ detail }: { detail: PatchTab }) => {
    activeTab = detail;
  };

  const onRevisionChanged = ({ detail }: { detail: string }) => {
    revisionNumber = parseInt(detail);
  };

  const onBrowse = (event: { detail: string }, revision: string) => {
    project.navigateTo({
      content: ProjectContent.Tree,
      revision,
      patch: null,
      path: event.detail
    });
  };

  let activeTab = PatchTab.Timeline;
  let revisionNumber = patch.revisions.length - 1;

  $: revision = patch.revisions[revisionNumber];
</script>

<style>
  header {
    padding: 1rem;
    background: var(--color-foreground-background-subtle);
    border-radius: var(--border-radius);
  }
  .patch {
    padding: 0 2rem 0 8rem;
  }
  .summary {
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  .summary-left {
    display: flex;
    align-items: center;
  }
  .summary-title {
    display: flex;
    margin-right: 0.75rem;
  }
  .id {
    font-size: 0.75rem;
    color: var(--color-foreground-faded);
  }
  .summary-state {
    padding: 0.5rem 1rem;
    border-radius: 1.25rem;
  }
  .proposed {
    color: var(--color-positive);
    background-color: var(--color-positive-background);
  }
  .draft {
    color: var(--color-positive);
    background-color: var(--color-positive-background);
  }
  .archived {
    background-color: var(--color-negative-2);
  }
  .flex {
    display: flex;
  }

  @media (max-width: 960px) {
    .patch {
      padding-left: 2rem;
    }
  }
</style>

<div class="patch">
  <header>
    <div class="summary">
      <div class="summary-left">
        <span class="summary-title text-medium">
          {patch.title}
        </span>
        <span class="font-mono id desktop">{patch.id}</span>
        <span class="font-mono id mobile">{formatObjectId(patch.id)}</span>
      </div>
      <div
        class="summary-state"
        class:proposed={patch.state === "proposed"}
        class:draft={patch.state === "draft"}
        class:archived={patch.state == "archived"}>
        {capitalize(patch.state)}
      </div>
    </div>
    <Authorship noAvatar {config}
      author={patch.author}
      timestamp={patch.timestamp}
      caption="opened" />
  </header>

  <PatchTabBar
    {activeTab}
    {revisionNumber}
    revisions={patch.revisions}
    on:switchTab={onSwitch}
    on:revisionChanged={onRevisionChanged} />

  <main>
    {#if activeTab === PatchTab.Timeline}
      <div class="flex">
        <PatchTimeline {patch} {revisionNumber} {config} {project} />
        <PatchSideBar {patch} />
      </div>
    {:else if activeTab === PatchTab.Diff && revision.changeset}
      <Changeset
        diff={revision.changeset.diff}
        stats={revision.changeset.stats}
        on:browse={e => onBrowse(e, revision.oid)} />
    {:else if activeTab === PatchTab.Diff}
      <Placeholder icon="🍳">
        <span slot="title">
          No changeset found
        </span>
        <span slot="body">
          We couldn't find a changeset related to this patch or revision
        </span>
      </Placeholder>
    {/if}
  </main>
</div>
