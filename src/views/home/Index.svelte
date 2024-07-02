<script lang="ts">
  import type { ComponentProps } from "svelte";
  import type { ProjectInfo } from "@app/components/ProjectCard";

  import { derived } from "svelte/store";

  import { baseUrlToString } from "@app/lib/utils";
  import { deduplicateStore } from "@app/lib/deduplicateStore";
  import { fetchProjectInfos } from "@app/components/ProjectCard";
  import { handleError } from "@app/views/home/error";
  import { preferredSeeds } from "@app/lib/seeds";

  import AppLayout from "@app/App/AppLayout.svelte";
  import ProjectCard from "@app/components/ProjectCard.svelte";

  import ErrorMessage from "@app/components/ErrorMessage.svelte";
  import HomepageSection from "./components/HomepageSection.svelte";
  import PreferredSeedDropdown from "./components/PreferredSeedDropdown.svelte";

  const selectedSeed = deduplicateStore(
    derived(preferredSeeds, $ => $?.selected),
  );

  let preferredSeedProjects:
    | ProjectInfo[]
    | ComponentProps<ErrorMessage>["error"]
    | undefined;

  async function loadPreferredSeedProjects() {
    preferredSeedProjects = undefined;

    if (!$selectedSeed) return;
    preferredSeedProjects = await fetchProjectInfos($selectedSeed, {
      show: "pinned",
    }).catch(error => error);
  }

  $: $selectedSeed && void loadPreferredSeedProjects();
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
    <HomepageSection
      loading={preferredSeedProjects === undefined}
      empty={preferredSeedProjects instanceof Error ||
        preferredSeedProjects?.length === 0}
      title="Explore">
      <svelte:fragment slot="title">
        <div class="flex-icon-item" style:min-width="0">
          <span class="txt-large">Explore</span>
          <PreferredSeedDropdown selectedSeed={$preferredSeeds.selected} />
        </div>
      </svelte:fragment>
      <svelte:fragment slot="subtitle">
        Pinned repositories on your selected seed node
      </svelte:fragment>
      <svelte:fragment slot="empty">
        <div class="empty-state">
          {#if preferredSeedProjects instanceof Error}
            <ErrorMessage
              {...handleError(
                preferredSeedProjects,
                baseUrlToString($preferredSeeds.selected),
              )} />
          {:else}
            <div class="heading">No pinned repositories</div>
            <div class="label">
              The selected seed node doesn't have any pinned repositories.
            </div>
          {/if}
        </div>
      </svelte:fragment>
      <div class="project-grid">
        {#if preferredSeedProjects && !(preferredSeedProjects instanceof Error)}
          {#each preferredSeedProjects as projectInfo}
            <ProjectCard {projectInfo} />
          {/each}
        {/if}
      </div>
    </HomepageSection>
  </div>
</AppLayout>
