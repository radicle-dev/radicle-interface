<script lang="ts" strictEvents>
  import type { ProjectResult } from "@app/lib/search";

  import * as modal from "@app/lib/modal";
  import Link from "@app/components/Link.svelte";
  import Modal from "@app/components/Modal.svelte";
  import { formatRepositoryId, getSeedEmoji } from "@app/lib/utils";

  export let query: string;
  export let results: ProjectResult[];
</script>

<style>
  .results {
    text-align: left;
  }
  ul {
    list-style-type: none;
    padding: 0;
  }
  li {
    margin: 0.5rem 0;
  }
  .id {
    color: var(--color-foreground-5);
  }
</style>

<Modal emoji="🔍" title={`Results for "${query}"`}>
  <span slot="body" class="results">
    {#if results.length > 0}
      <div class="txt-highlight txt-medium">Projects</div>
      <ul>
        {#each results as project}
          <li>
            <Link
              on:click={modal.hide}
              route={{
                resource: "projects",
                params: {
                  view: { resource: "tree" },
                  seed: project.seed.host,
                  id: project.info.id,
                },
              }}>
              <span title={project.seed.host}>
                <span>
                  {getSeedEmoji(project.seed.host)}&nbsp;{project.info.name}
                </span>
                <span class="id">
                  &nbsp;{formatRepositoryId(project.info.id)}
                </span>
              </span>
            </Link>
          </li>
        {/each}
      </ul>
    {/if}
  </span>
</Modal>
