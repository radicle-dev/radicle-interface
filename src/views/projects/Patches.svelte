<script lang="ts" context="module">
  import type { Patch, PatchState } from "@httpd-client";

  export type PatchStatus = PatchState["status"];
</script>

<script lang="ts">
  import type { Tab } from "@app/components/TabBar.svelte";
  import type { BaseUrl } from "@httpd-client";

  import * as router from "@app/lib/router";
  import capitalize from "lodash/capitalize";
  import { HttpdClient } from "@httpd-client";

  import Button from "@app/components/Button.svelte";
  import ErrorMessage from "@app/components/ErrorMessage.svelte";
  import Loading from "@app/components/Loading.svelte";
  import PatchTeaser from "./Patch/PatchTeaser.svelte";
  import Placeholder from "@app/components/Placeholder.svelte";
  import TabBar from "@app/components/TabBar.svelte";

  export let projectId: string;
  export let state: PatchStatus;
  export let baseUrl: BaseUrl;
  export let patchCounters: {
    draft: number;
    open: number;
    archived: number;
    merged: number;
  };

  const perPage = 10;

  // Keeping it true, to avoid an initial flash
  // of EmptyState Placeholder
  let refresh = true;
  let loading = false;
  let page = 0;
  let error: any;
  let patches: Patch[] = [];

  const api = new HttpdClient(baseUrl);

  async function loadPatches(): Promise<void> {
    loading = true;
    try {
      const response = await api.project.getAllPatches(projectId, {
        state,
        page,
        perPage,
      });
      patches = [...patches, ...response];
      page += 1;
    } catch (e) {
      error = e;
    } finally {
      loading = false;
      refresh = false;
    }
  }

  function switchState(e: CustomEvent<PatchStatus>): void {
    refresh = true;
    // Update state to be used in the query
    state = e.detail;
    // Reset page to 0 to load the first page for a new state
    page = 0;
    // Remove all existing patches with old state
    patches = [];
    loadPatches();
    router.updateProjectRoute({
      search: `state=${state}`,
    });
  }

  const stateOptions: PatchStatus[] = ["draft", "open", "archived", "merged"];
  const options = stateOptions.map<Tab<PatchStatus>>(s => ({
    value: s,
    title: `${patchCounters[s]} ${s}`,
    disabled: patchCounters[s] === 0,
  }));
  $: showMoreButton =
    !loading &&
    !error &&
    patchCounters[state] &&
    patches.length < patchCounters[state];

  loadPatches();
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
  .loader {
    margin-top: 8rem;
  }
  .more {
    margin-top: 2rem;
    text-align: center;
    min-height: 3rem;
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
    <TabBar {options} on:select={switchState} active={state} />
  </div>
  <div class="patches-list">
    {#if refresh}
      <div class="loader">
        <Loading center />
      </div>
    {:else}
      {#each patches as patch}
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
      {:else}
        {#if error}
          <ErrorMessage message="Couldn't load patches." stackTrace={error} />
        {:else}
          <Placeholder emoji="🍂">
            <div slot="title">{capitalize(state)} patches</div>
            <div slot="body">No patches matched the current filter</div>
          </Placeholder>
        {/if}
      {/each}
      <div class="more">
        {#if loading}
          <Loading small={page !== 0} center />
        {/if}

        {#if showMoreButton}
          <Button variant="foreground" on:click={loadPatches}>More</Button>
        {/if}
      </div>
    {/if}
  </div>
</div>
