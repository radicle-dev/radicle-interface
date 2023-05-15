<script lang="ts" context="module">
  import type { Patch, PatchState } from "@httpd-client";

  export type PatchStatus = PatchState["status"];
</script>

<script lang="ts">
  import type { BaseUrl } from "@httpd-client";

  import capitalize from "lodash/capitalize";
  import { HttpdClient } from "@httpd-client";

  import Button from "@app/components/Button.svelte";
  import ErrorMessage from "@app/components/ErrorMessage.svelte";
  import Loading from "@app/components/Loading.svelte";
  import PatchTeaser from "./Patch/PatchTeaser.svelte";
  import Placeholder from "@app/components/Placeholder.svelte";
  import ProjectLink from "@app/components/ProjectLink.svelte";
  import SquareButton from "@app/components/SquareButton.svelte";

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

  let loading = false;
  let page = 0;
  let error: any;
  let patches: Patch[] = [];

  const api = new HttpdClient(baseUrl);

  async function loadPatches(state: PatchStatus): Promise<void> {
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
    }
  }

  interface Tab {
    value: PatchStatus;
    title: string;
    disabled: boolean;
  }

  const stateOptions: PatchStatus[] = ["draft", "open", "archived", "merged"];
  const options = stateOptions.map<Tab>(s => ({
    value: s,
    title: `${patchCounters[s]} ${s}`,
    disabled: patchCounters[s] === 0,
  }));

  $: showMoreButton =
    !loading &&
    !error &&
    patchCounters[state] &&
    patches.length < patchCounters[state];

  $: {
    page = 0;
    patches = [];
    loadPatches(state);
  }
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
          <ProjectLink
            projectParams={{
              search: `state=${option.value}`,
            }}>
            <SquareButton
              clickable={option.disabled}
              active={option.value === state}
              disabled={option.disabled}>
              {option.title}
            </SquareButton>
          </ProjectLink>
        {/if}
      {/each}
    </div>
  </div>
  <div class="patches-list">
    {#each patches as patch}
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
      <Button variant="foreground" on:click={() => loadPatches(state)}>
        More
      </Button>
    {/if}
  </div>
</div>
