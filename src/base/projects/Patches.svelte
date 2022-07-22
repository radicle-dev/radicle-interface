<script lang="ts">
  import type { Config } from "@app/config";
  import type { Patch } from "@app/patch";
  import { Project, ProjectContent } from "@app/project";
  import PatchFilter from "./Patch/PatchFilter.svelte";
  import PatchTeaser from "./Patch/PatchTeaser.svelte";

  export let config: Config;
  export let patches: Patch[];
  export let project: Project;

  const navigate = (patch: string) => {
    project.navigateTo({
      content: ProjectContent.Patch,
      patch,
      issue: null,
      revision: null,
      path: null
    });
  };
</script>

<style>
  .patches {
    padding: 0 2rem 0 8rem;
    font-size: 0.875rem;
  }

  .teaser:first-child {
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
  }
  .teaser:last-child {
    border-bottom-left-radius: 0.25rem;
    border-bottom-right-radius: 0.25rem;
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
  <PatchFilter {patches} let:filteredPatches>
    <div class="patches-list">
      {#each filteredPatches as patch}
        <div class="teaser" on:click={() => navigate(patch.id)}>
          <PatchTeaser {config} {patch} />
        </div>
      {/each}
    </div>
  </PatchFilter>
</div>
