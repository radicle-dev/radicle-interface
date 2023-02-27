<script lang="ts" context="module">
  import type { PatchState } from "@httpd-client";

  export type PatchStatus = PatchState["status"];
</script>

<script lang="ts">
  import type { Patch } from "@httpd-client";
  import type { Tab } from "@app/components/TabBar.svelte";
  import type { BaseUrl } from "@httpd-client";

  import * as router from "@app/lib/router";
  import PatchTeaser from "./Patch/PatchTeaser.svelte";
  import Placeholder from "@app/components/Placeholder.svelte";
  import capitalize from "lodash/capitalize";
  import TabBar from "@app/components/TabBar.svelte";

  export let patches: Patch[];
  export let status: PatchStatus;
  export let baseUrl: BaseUrl;
  export let projectId: string;
  export let projectPatches: {
    draft: number;
    open: number;
    archived: number;
    merged: number;
  };

  let options: Tab<PatchStatus>[];

  function groupPatches(patches: Patch[]): {
    open: Patch[];
    draft: Patch[];
    archived: Patch[];
    merged: Patch[];
  } {
    return patches.reduce(
      (acc, patch) => {
        acc[patch.state.status].push(patch);
        return acc;
      },
      {
        open: [] as Patch[],
        draft: [] as Patch[],
        archived: [] as Patch[],
        merged: [] as Patch[],
      },
    );
  }

  const stateOptions: PatchStatus[] = ["draft", "open", "archived", "merged"];
  $: options = stateOptions.map<{
    value: PatchStatus;
    title: string;
    disabled: boolean;
  }>((s: PatchStatus) => ({
    value: s,
    title: `${projectPatches[s]} ${s}`,
    disabled: projectPatches[s] === 0,
  }));
  $: filteredPatches = groupPatches(patches)[status];
  $: sortedPatches = filteredPatches.sort(
    ({ revisions: [r1] }, { revisions: [r2] }) => r2.timestamp - r1.timestamp,
  );
</script>

<style>
  .patches {
    padding: 0 2rem 0 8rem;
    font-size: var(--font-size-small);
  }
  .patches-list {
    border-radius: var(--border-radius);
    overflow: hidden;
  }
  .teaser:not(:last-child) {
    border-bottom: 1px dashed var(--color-background);
  }

  @media (max-width: 960px) {
    .patches {
      padding-left: 2rem;
    }
  }
</style>

<div class="patches">
  <div style="margin-bottom: 1rem;">
    <TabBar
      {options}
      on:select={e =>
        router.updateProjectRoute({
          search: `state=${e.detail}`,
        })}
      active={status} />
  </div>
  {#if filteredPatches.length}
    <div class="patches-list">
      {#each sortedPatches as patch}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
          class="teaser"
          on:click={() => {
            router.updateProjectRoute({
              view: {
                resource: "patch",
                params: { patch: patch.id },
              },
            });
          }}>
          <PatchTeaser {baseUrl} {projectId} {patch} />
        </div>
      {/each}
    </div>
  {:else}
    <Placeholder emoji="🍂">
      <div slot="title">{capitalize(status)} patches</div>
      <div slot="body">No issues matched the current filter</div>
    </Placeholder>
  {/if}
</div>
