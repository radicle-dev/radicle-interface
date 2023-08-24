<script lang="ts">
  import IconButton from "./IconButton.svelte";
  import IconSmall from "./IconSmall.svelte";

  export let expanded: boolean = true;
  export let variant: "left-aligned" | "inline" = "left-aligned";
</script>

<style>
  .expand {
    display: flex;
    background: none;
  }
</style>

<IconButton ariaLabel="expand" on:click={() => (expanded = !expanded)}>
  <div class="expand">
    {#if expanded}
      <IconSmall name={variant === "inline" ? "ellipsis" : "chevron-down"} />
    {:else}
      <IconSmall name={variant === "inline" ? "ellipsis" : "chevron-right"} />
    {/if}
  </div>
</IconButton>
