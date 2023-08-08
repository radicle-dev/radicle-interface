<script lang="ts" strictEvents>
  import type { ProjectBaseUrl } from "@app/lib/search";

  import * as modal from "@app/lib/modal";
  import { formatRepositoryId } from "@app/lib/utils";

  import Link from "@app/components/Link.svelte";
  import Modal from "@app/components/Modal.svelte";

  export let query: string;
  export let results: ProjectBaseUrl[];
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
        {#each results as result}
          <li>
            <Link
              on:afterNavigate={modal.hide}
              route={{
                resource: "project.source",
                node: result.baseUrl,
                project: result.project.id,
              }}>
              <span title={result.baseUrl.hostname}>
                <span>{result.project.name}</span>
                <span class="id">
                  &nbsp;{formatRepositoryId(result.project.id)}
                </span>
              </span>
            </Link>
          </li>
        {/each}
      </ul>
    {/if}
  </span>
</Modal>
