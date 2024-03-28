<script lang="ts">
  import Badge from "@app/components/Badge.svelte";

  export let labels: string[];
</script>

<style>
  .label {
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>

{#each labels.slice(0, 4) as label}
  <Badge style="max-width:7rem" variant="neutral">
    <span class="label">{label}</span>
  </Badge>
{/each}
{#if labels.length > 4}
  <Badge title={labels.slice(4, undefined).join(" ")} variant="neutral">
    <span class="label">
      +{labels.length - 4} more label{labels.length > 5 ? "s" : ""}
    </span>
  </Badge>
{/if}
