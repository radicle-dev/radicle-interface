<script lang="ts">
  import type { Reaction } from "@http-client";

  import { formatNodeId } from "@app/lib/utils";

  import Avatar from "@app/components/Avatar.svelte";
  import Badge from "@app/components/Badge.svelte";

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
    gap: 0.5rem;
    font-size: var(--font-size-small);
  }
  .assignee {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 0.25rem;
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
      align-items: flex-start;
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
    {#each assignees as { id }}
      <Badge variant="neutral" size="small">
        <div class="assignee">
          <Avatar inline nodeId={id} />
          <span>{formatNodeId(id)}</span>
        </div>
      </Badge>
    {:else}
      <div class="txt-missing no-assignees">No assignees</div>
    {/each}
  </div>
</div>
