<script lang="ts">
  import type { BaseUrl, Patch, PatchState } from "@httpd-client";

  import capitalize from "lodash/capitalize";
  import { HttpdClient } from "@httpd-client";
  import { PATCHES_PER_PAGE } from "./router";

  import Button from "@app/components/Button.svelte";
  import ErrorMessage from "@app/components/ErrorMessage.svelte";
  import Link from "@app/components/Link.svelte";
  import Loading from "@app/components/Loading.svelte";
  import PatchTeaser from "./Patch/PatchTeaser.svelte";
  import Placeholder from "@app/components/Placeholder.svelte";
  import SquareButton from "@app/components/SquareButton.svelte";

  export let projectId: string;
  export let baseUrl: BaseUrl;
  export let patches: Patch[];
  export let state: PatchState["status"];
  export let patchCounters: {
    draft: number;
    open: number;
    archived: number;
    merged: number;
  };

  let loading = false;
  let page = 0;
  let error: any;
  let allPatches: Patch[];

  $: {
    allPatches = patches;
    page = 0;
  }

  const api = new HttpdClient(baseUrl);

  async function loadMore(state: PatchState["status"]): Promise<void> {
    loading = true;
    page += 1;
    try {
      const response = await api.project.getAllPatches(projectId, {
        state,
        page,
        perPage: PATCHES_PER_PAGE,
      });
      allPatches = [...allPatches, ...response];
    } catch (e) {
      error = e;
    } finally {
      loading = false;
    }
  }

  interface Tab {
    value: PatchState["status"];
    title: string;
    disabled: boolean;
  }

  const stateOptions: PatchState["status"][] = [
    "draft",
    "open",
    "archived",
    "merged",
  ];
  const options = stateOptions.map<Tab>(s => ({
    value: s,
    title: `${patchCounters[s]} ${s}`,
    disabled: patchCounters[s] === 0,
  }));

  $: showMoreButton =
    !loading && !error && allPatches.length < patchCounters[state];
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
  <div style="margin-bottom: 2rem;">
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
      {#each options as option}
        {#if option.disabled}
          <SquareButton
            clickable={option.disabled}
            active={option.value === state}
            disabled={option.disabled}>
            {option.title}
          </SquareButton>
        {:else}
          <Link
            route={{
              resource: "project.patches",
              project: projectId,
              seed: baseUrl,
              search: `state=${option.value}`,
            }}>
            <SquareButton
              clickable={option.disabled}
              active={option.value === state}
              disabled={option.disabled}>
              {option.title}
            </SquareButton>
          </Link>
        {/if}
      {/each}
    </div>
  </div>
  <div class="patches-list">
    {#each allPatches as patch (patch.id)}
      <div class="teaser">
        <PatchTeaser {baseUrl} {projectId} {patch} />
      </div>
    {:else}
      {#if error}
        <ErrorMessage message="Couldn't load patches." stackTrace={error} />
      {:else if loading}
        <!-- We already show a loader below. -->
      {:else}
        <Placeholder emoji="🍂">
          <div slot="title">{capitalize(state)} patches</div>
          <div slot="body">No patches matched the current filter</div>
        </Placeholder>
      {/if}
    {/each}
  </div>
  <div class="more">
    {#if loading}
      <div style:margin-top={page === 0 ? "8rem" : ""}>
        <Loading small={page !== 0} center />
      </div>
    {/if}

    {#if showMoreButton}
      <Button variant="foreground" on:click={() => loadMore(state)}>
        More
      </Button>
    {/if}
  </div>
</div>
