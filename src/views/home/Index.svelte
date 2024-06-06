<script lang="ts">
  import type { ComponentProps } from "svelte";
  import type { ProjectInfo } from "@app/components/ProjectCard";
  import type { BaseUrl, ProjectListQuery } from "@http-client";

  import storedWritable from "@efstajas/svelte-stored-writable";
  import { derived } from "svelte/store";
  import { literal, union } from "zod";

  import { api, httpdStore } from "@app/lib/httpd";
  import { baseUrlToString } from "@app/lib/utils";
  import { deduplicateStore } from "@app/lib/deduplicateStore";
  import { experimental } from "@app/lib/appearance";
  import { fetchProjectInfos } from "@app/components/ProjectCard";
  import { handleError } from "@app/views/home/error";
  import { isDelegate } from "@app/lib/roles";
  import { preferredSeeds } from "@app/lib/seeds";

  import AppLayout from "@app/App/AppLayout.svelte";
  import ProjectCard from "@app/components/ProjectCard.svelte";

  import Command from "@app/components/Command.svelte";
  import ErrorMessage from "@app/components/ErrorMessage.svelte";
  import FilterButton from "./components/FilterButton.svelte";
  import HomepageSection from "./components/HomepageSection.svelte";
  import IconButton from "@app/components/IconButton.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import NewProjectButton from "./components/NewProjectButton.svelte";
  import Popover from "@app/components/Popover.svelte";
  import PreferredSeedDropdown from "./components/PreferredSeedDropdown.svelte";

  export let configPreferredSeeds: BaseUrl[];

  const selectedSeed = deduplicateStore(
    derived(preferredSeeds, $ => $?.selected),
  );
  const localProjectsFilterSchema = union([
    literal("all"),
    literal("delegating"),
  ]);
  const localProjectsFilter = storedWritable(
    "localProjectsFilter",
    localProjectsFilterSchema,
    "all",
  );

  let localProjects:
    | ProjectInfo[]
    | ComponentProps<ErrorMessage>["error"]
    | undefined;
  let preferredSeedProjects:
    | ProjectInfo[]
    | ComponentProps<ErrorMessage>["error"]
    | undefined;

  async function loadLocalProjects() {
    const query: ProjectListQuery = { show: "all" };
    await api
      .getStats()
      .then(({ repos: { total } }) => (query.perPage = total))
      .catch(e => {
        console.error(
          "Not able to query to total repo count for your local node.",
          e,
        );
      });

    localProjects = undefined;
    localProjects = await fetchProjectInfos(api.baseUrl, query).catch(
      error => error,
    );
  }

  async function loadPreferredSeedProjects() {
    preferredSeedProjects = undefined;

    if (!$selectedSeed) return;
    preferredSeedProjects = await fetchProjectInfos($selectedSeed, {
      show: "pinned",
    }).catch(error => error);
  }

  $: nodeId = $httpdStore.state !== "stopped" ? $httpdStore.node.id : undefined;
  $: nodeId && void loadLocalProjects();
  $: $selectedSeed && void loadPreferredSeedProjects();
  $: filteredLocalProjects =
    $localProjectsFilter === "all" ||
    localProjects instanceof Error ||
    localProjects === undefined
      ? localProjects
      : localProjects.filter(p =>
          isDelegate(
            nodeId,
            p.project.delegates.map(d => d.id),
          ),
        );
</script>

<style>
  .wrapper {
    padding: 3rem;
    max-width: 78rem;
    margin: 0 auto;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }
  .empty-state {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  .empty-state .heading {
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-bold);
  }
  .empty-state .label {
    display: block;
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-regular);
  }
  .flex-icon-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .project-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(21rem, 1fr));
    gap: 1rem;
  }

  @media (max-width: 719.98px) {
    .wrapper {
      width: 100%;
      padding: 1rem;
    }
  }
</style>

<AppLayout>
  <div class="wrapper" style:padding-bottom="2.5rem">
    {#if nodeId}
      <div class="global-hide-on-mobile-down">
        <HomepageSection
          loading={$httpdStore.state !== "stopped" &&
            localProjects === undefined}
          empty={$httpdStore.state === "stopped" ||
            (filteredLocalProjects instanceof Array &&
              !filteredLocalProjects.length) ||
            localProjects instanceof Error}
          title="Local projects">
          <svelte:fragment slot="subtitle">
            Projects you're seeding with your local node
          </svelte:fragment>
          <svelte:fragment slot="actions">
            {#if $experimental}
              <FilterButton
                disabled={!nodeId}
                bind:value={$localProjectsFilter} />
              <NewProjectButton disabled={!nodeId} />
            {/if}
          </svelte:fragment>
          <svelte:fragment slot="empty">
            <div class="empty-state">
              {#if localProjects instanceof Error}
                <ErrorMessage
                  {...handleError(
                    localProjects,
                    baseUrlToString(api.baseUrl),
                  )} />
              {:else if !localProjects?.length}
                <div class="heading">No local projects</div>
                <div class="label">
                  Seed or check out a project to work with it on your local
                  node.
                </div>
              {:else}
                <div class="heading">Nothing to see here</div>
                <div class="label">
                  No local projects matched your filter settings.
                </div>
              {/if}
            </div>
          </svelte:fragment>
          <div class="project-grid">
            {#if filteredLocalProjects && !(filteredLocalProjects instanceof Error)}
              {#each filteredLocalProjects as projectInfo}
                {@const delegates = projectInfo.project.delegates.map(
                  d => d.id,
                )}
                <ProjectCard
                  {projectInfo}
                  isDelegate={isDelegate(nodeId, delegates) ?? false} />
              {/each}
            {/if}
          </div>
        </HomepageSection>
      </div>
    {/if}

    <HomepageSection
      loading={preferredSeedProjects === undefined}
      empty={preferredSeedProjects instanceof Error ||
        preferredSeedProjects?.length === 0}
      title="Explore">
      <svelte:fragment slot="title">
        <div class="flex-icon-item" style:min-width="0">
          <span class="txt-large">Explore</span>
          <PreferredSeedDropdown
            initialPreferredSeeds={configPreferredSeeds}
            selectedSeed={$preferredSeeds.selected} />
        </div>
      </svelte:fragment>
      <svelte:fragment slot="subtitle">
        Pinned repositories on your selected seed node
        {#if !nodeId}
          <div class="global-hide-on-mobile-down">
            <Popover popoverPositionTop="2.5rem" popoverPositionLeft="0">
              <IconButton slot="toggle" let:toggle on:click={toggle}>
                <span style:color="var(--color-fill-gray)">
                  <IconSmall name="info" />
                </span>
              </IconButton>

              <div slot="popover" class="popover txt-small" style:width="15rem">
                <div style:padding-bottom="0.5rem">
                  To browse your local projects, run:
                </div>
                <Command command="radicle-httpd" />
              </div>
            </Popover>
          </div>
        {/if}
      </svelte:fragment>
      <svelte:fragment slot="empty">
        <div class="empty-state">
          {#if preferredSeedProjects instanceof Error}
            <ErrorMessage
              {...handleError(
                preferredSeedProjects,
                baseUrlToString(api.baseUrl),
              )} />
          {:else}
            <div class="heading">No pinned projects</div>
            <div class="label">
              The selected seed node doesn't have any pinned projects.
            </div>
          {/if}
        </div>
      </svelte:fragment>
      <div class="project-grid">
        {#if preferredSeedProjects && !(preferredSeedProjects instanceof Error)}
          {#each preferredSeedProjects as projectInfo}
            {@const delegates = projectInfo.project.delegates.map(d => d.id)}
            <ProjectCard
              {projectInfo}
              isDelegate={isDelegate(nodeId, delegates) ?? false} />
          {/each}
        {/if}
      </div>
    </HomepageSection>
  </div>
</AppLayout>
