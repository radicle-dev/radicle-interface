<script lang="ts">
  import type { BaseUrl, Patch, PatchState, Project } from "@httpd-client";

  import capitalize from "lodash/capitalize";
  import { HttpdClient } from "@httpd-client";
  import { PATCHES_PER_PAGE } from "./router";

  import ErrorMessage from "@app/components/ErrorMessage.svelte";
  import Layout from "./Layout.svelte";
  import Link from "@app/components/Link.svelte";
  import Loading from "@app/components/Loading.svelte";
  import PatchTeaser from "./Patch/PatchTeaser.svelte";
  import Placeholder from "@app/components/Placeholder.svelte";
  import Button from "@app/components/Button.svelte";

  export let baseUrl: BaseUrl;
  export let patches: Patch[];
  export let project: Project;
  export let state: PatchState["status"];

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
      const response = await api.project.getAllPatches(project.id, {
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

  $: options = stateOptions.map<Tab>(s => ({
    value: s,
    title: `${project.patches[s]} ${s}`,
    disabled: project.patches[s] === 0,
  }));

  $: showMoreButton =
    !loading && !error && allPatches.length < project.patches[state];
</script>

<style>
  .patches {
    font-size: var(--font-size-small);
  }
  .patches-list {
    border-radius: var(--border-radius-small);
    overflow: hidden;
    box-shadow: inset 0 0 0 1px var(--color-border-hint);
    background-color: var(--color-background-float);
  }
  .more {
    margin-top: 2rem;
    min-height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .teaser:not(:last-child) {
    border-bottom: 1px solid var(--color-border-hint);
  }

  .tab-bar {
    display: flex;
    margin-top: 1rem;
    flex-wrap: wrap;
    background-color: var(--color-background-float);
    box-shadow: inset 0 0 0 1px var(--color-border-hint);
    border-radius: 2px;
    width: fit-content;
    overflow: hidden;
  }

  @media (max-width: 720px) {
    .patches-list {
      border-radius: 0;
    }
  }
</style>

<Layout {baseUrl} {project} activeTab="patches">
  <svelte:fragment slot="subheader">
    <div class="tab-bar">
      {#each options as option}
        {#if option.disabled}
          <Button
            clickable={!option.disabled}
            square={option.value === state}
            variant={option.value === state ? "tab" : "none"}
            disabled={option.disabled}>
            {option.title}
          </Button>
        {:else}
          <Link
            route={{
              resource: "project.patches",
              project: project.id,
              node: baseUrl,
              search: `state=${option.value}`,
            }}>
            <Button
              clickable={!option.disabled}
              square={option.value === state}
              variant={option.value === state ? "tab" : "none"}
              disabled={option.disabled}>
              {option.title}
            </Button>
          </Link>
        {/if}
      {/each}
    </div>
  </svelte:fragment>

  <div class="patches">
    {#if allPatches.length > 0}
      <div class="patches-list">
        {#each allPatches as patch (patch.id)}
          <div class="teaser">
            <PatchTeaser {baseUrl} projectId={project.id} {patch} />
          </div>
        {/each}
      </div>
    {:else if error}
      <ErrorMessage message="Couldn't load patches." stackTrace={error} />
    {:else if loading}
      <!-- We already show a loader below. -->
    {:else}
      <Placeholder emoji="🍂">
        <div slot="title">{capitalize(state)} patches</div>
        <div slot="body">No patches matched the current filter</div>
      </Placeholder>
    {/if}
    <div class="more">
      {#if loading}
        <div style:margin-top={page === 0 ? "8rem" : ""}>
          <Loading noDelay small={page !== 0} center />
        </div>
      {/if}

      {#if showMoreButton}
        <Button size="large" variant="outline" on:click={() => loadMore(state)}>
          More
        </Button>
      {/if}
    </div>
  </div>
</Layout>
