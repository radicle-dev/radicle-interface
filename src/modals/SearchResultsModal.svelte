<script lang="ts" strictEvents>
  import type { ProjectBaseUrl } from "@app/lib/search";

  import * as modal from "@app/lib/modal";
  import { formatRepositoryId } from "@app/lib/utils";

  import Modal from "@app/components/Modal.svelte";
  import Icon from "@app/components/Icon.svelte";
  import Link from "@app/components/Link.svelte";

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
</style>

<Modal title={`Results for "${query}"`}>
  <Icon name="magnifying-glass" size="48" slot="icon" />

  <span slot="body" class="results">
    {#if results.length > 0}
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
