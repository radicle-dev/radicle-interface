<script lang="ts" context="module">
  import type { PatchState } from "@app/lib/patch";

  export type PatchStatus = PatchState["status"];
</script>

<script lang="ts">
  import type { Patch } from "@app/lib/patch";
  import type { Project } from "@app/lib/project";
  import type { Tab } from "@app/components/TabBar.svelte";

  import * as router from "@app/lib/router";
  import PatchTeaser from "./Patch/PatchTeaser.svelte";
  import Placeholder from "@app/components/Placeholder.svelte";
  import capitalize from "lodash/capitalize";
  import TabBar from "@app/components/TabBar.svelte";
  import { groupPatches } from "@app/lib/patch";

  export let patches: Patch[];
  export let status: PatchStatus;
  export let project: Project;

  let options: Tab<PatchStatus>[];

  const stateOptions: PatchStatus[] = ["draft", "open", "archived", "merged"];
  $: options = stateOptions.map<{
    value: PatchStatus;
    title: string;
    disabled: boolean;
  }>((s: PatchStatus) => ({
    value: s,
    title:
      project.patches[s] !== undefined
        ? `${project.patches[s]} ${s}`
        : `0 ${s}`,
    disabled: project.patches[s] === 0 || project.patches[s] === undefined,
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
          <PatchTeaser {project} {patch} />
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
