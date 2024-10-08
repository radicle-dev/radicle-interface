<script lang="ts">
  import type { Reaction, BaseUrl } from "@http-client";
  import NodeId from "@app/components/NodeId.svelte";

  export let baseUrl: BaseUrl;
  export let assignees: Reaction["authors"] = [];
</script>

<style>
  .header {
    font-size: var(--font-size-small);
    margin-bottom: 0.75rem;
  }
  .body {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    width: 100%;
    gap: 0.5rem;
    font-size: var(--font-size-small);
  }
  @media (max-width: 1349.98px) {
    .wrapper {
      display: flex;
      flex-direction: row;
      gap: 1rem;
      align-items: flex-start;
    }
    .header {
      margin-bottom: 0;
      height: 2rem;
      display: flex;
      align-items: center;
    }
    .body {
      align-items: center;
      align-self: center;
    }
    .no-assignees {
      height: 2rem;
      display: flex;
      align-items: center;
    }
  }
</style>

<div class="wrapper">
  <div class="header">Assignees</div>
  <div class="body">
    {#each assignees as { id, alias }}
      <div>
        <NodeId {baseUrl} nodeId={id} {alias} />
      </div>
    {:else}
      <div class="txt-missing no-assignees">No assignees</div>
    {/each}
  </div>
</div>
