<script lang="ts">
  import type { ProjectWithListingData } from "@app/lib/projects";
  import type { BaseUrl } from "@httpd-client";

  import storedWritable from "@efstajas/svelte-stored-writable";
  import { HttpdClient } from "@httpd-client";
  import { derived } from "svelte/store";
  import { literal, union } from "zod";

  import { api, httpdStore } from "@app/lib/httpd";
  import { deduplicateStore } from "@app/lib/deduplicateStore";
  import { getProjectsListingData } from "@app/lib/projects";
  import { isDelegate } from "@app/lib/roles";
  import { prefferedSeeds } from "@app/lib/seeds";

  import AppLayout from "@app/App/AppLayout.svelte";
  import Button from "@app/components/Button.svelte";
  import ConnectInstructions from "@app/components/ConnectInstructions.svelte";
  import ProjectCard from "@app/components/ProjectCard.svelte";

  import FilterButton from "./components/FilterButton.svelte";
  import HomepageSection from "./components/HomepageSection.svelte";
  import NewProjectButton from "./components/NewProjectButton.svelte";
  import PreferredSeedDropdown from "./components/PreferredSeedDropdown.svelte";

  const selectedSeed = deduplicateStore(
    derived(prefferedSeeds, $ => $?.selected),
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

  let localProjects: ProjectWithListingData[] | "error" | undefined;
  let preferredSeedProjects: ProjectWithListingData[] | "error" | undefined;

  async function fetchProjects(baseUrl: BaseUrl, show: "all" | "pinned") {
    const api = new HttpdClient(baseUrl);

    const projects = (await api.project.getAll({ perPage: 30, show })).map(
      project => ({
        project,
        baseUrl,
      }),
    );

    return await getProjectsListingData(projects);
  }

  function handleProjectLoadError(): "error" {
    return "error";
  }

  async function loadLocalProjects() {
    localProjects = undefined;
    localProjects = await fetchProjects(api.baseUrl, "all").catch(
      handleProjectLoadError,
    );
  }

  async function loadPreferredSeedProjects() {
    preferredSeedProjects = undefined;

    if (!$selectedSeed) return;
    preferredSeedProjects = await fetchProjects($selectedSeed, "pinned").catch(
      handleProjectLoadError,
    );
  }

  function isSeeding(projectId: string) {
    if (localProjects === "error") return false;
    return localProjects?.some(p => p.project.id === projectId) ?? false;
  }

  $: nodeId = $httpdStore.state !== "stopped" ? $httpdStore.node.id : undefined;
  $: nodeId && void loadLocalProjects();
  $: $selectedSeed && void loadPreferredSeedProjects();
  $: filteredLocalProjects =
    $localProjectsFilter === "all" ||
    localProjects === "error" ||
    localProjects === undefined
      ? localProjects
      : localProjects.filter(p => isDelegate(nodeId, p.project.delegates));
</script>

<style>
  .wrapper {
    padding: 3rem;
    max-width: 72rem;
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
  .empty-state .action {
    margin-top: 0.5rem;
  }
  .project-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
    gap: 1rem;
  }

  @media (max-width: 720px) {
    .wrapper {
      width: 100%;
      padding: 1rem 1.5rem 1.5rem 1.5rem;
    }

    .seed-dropdown {
      display: none;
    }
  }
</style>

<AppLayout>
  <div class="wrapper">
    <div class="global-hide-on-mobile">
      <HomepageSection
        loading={$httpdStore.state !== "stopped" && localProjects === undefined}
        empty={localProjects === "error" ||
          $httpdStore.state === "stopped" ||
          !filteredLocalProjects?.length}
        title="Local projects"
        subtitle="Projects you’re seeding with your local node">
        <svelte:fragment slot="actions">
          <FilterButton disabled={!nodeId} bind:value={$localProjectsFilter} />
          <NewProjectButton disabled={!nodeId} />
        </svelte:fragment>
        <svelte:fragment slot="empty">
          <div class="empty-state">
            {#if !nodeId}
              <div style="text-align: left; width: 100%;">
                <ConnectInstructions />
              </div>
            {:else if localProjects === "error"}
              <div class="heading">Error loading projects</div>
              <div class="label">
                There was an error loading projects from your local node.
              </div>
              <div class="action"><Button>Learn more</Button></div>
            {:else if !localProjects?.length}
              <div class="heading">No local projects</div>
              <div class="label">
                Seed or check out a project to work with it on your local node.
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
          {#if filteredLocalProjects && filteredLocalProjects !== "error"}
            {#each filteredLocalProjects as { project, baseUrl, activity, lastCommit }}
              <ProjectCard
                id={project.id}
                name={project.name}
                description={project.description}
                numberOfIssues={project.issues.open}
                numberOfPatches={project.patches.open}
                isPrivate={project.visibility?.type === "private"}
                isSeeding={true}
                isDelegate={isDelegate(nodeId, project.delegates) ?? false}
                lastUpdatedTimestamp={lastCommit.commit.committer.time}
                {activity}
                {baseUrl} />
            {/each}
          {/if}
        </div>
      </HomepageSection>
    </div>

    <HomepageSection
      loading={preferredSeedProjects === undefined}
      empty={preferredSeedProjects === "error" ||
        preferredSeedProjects?.length === 0}
      title="Explore"
      subtitle="Pinned projects on your selected seed node">
      <svelte:fragment slot="actions">
        <div class="seed-dropdown">
          {#if $prefferedSeeds}
            <PreferredSeedDropdown
              disabled={!nodeId || preferredSeedProjects === undefined}
              preferredSeed={$prefferedSeeds?.selected} />
          {/if}
        </div>
      </svelte:fragment>
      <svelte:fragment slot="empty">
        <div class="empty-state">
          {#if preferredSeedProjects === "error"}
            <div class="heading">Something went wrong</div>
            <div class="label">
              There was an error loading projects from your preferred seed node.
            </div>
          {:else}
            <div class="heading">Nothing to see here</div>
            <div class="label">
              Your preferred seed node doesn't have any pinned projects.
            </div>
          {/if}
        </div>
      </svelte:fragment>
      <div class="project-grid">
        {#if preferredSeedProjects && preferredSeedProjects !== "error"}
          {#each preferredSeedProjects as { project, baseUrl, activity, lastCommit }}
            <ProjectCard
              id={project.id}
              name={project.name}
              description={project.description}
              numberOfIssues={project.issues.open}
              numberOfPatches={project.patches.open}
              isPrivate={project.visibility?.type === "private"}
              isSeeding={isSeeding(project.id)}
              isDelegate={isDelegate(nodeId, project.delegates) ?? false}
              lastUpdatedTimestamp={lastCommit.commit.committer.time}
              {activity}
              {baseUrl} />
          {/each}
        {/if}
      </div>
    </HomepageSection>
  </div>
</AppLayout>
