<script lang="ts" strictEvents>
  import { createEventDispatcher } from "svelte";

  import IconButton from "./IconButton.svelte";
  import IconSmall from "./IconSmall.svelte";

  export let variant: "left-aligned" | "inline" = "left-aligned";

  let expanded: boolean = true;
  const dispatch = createEventDispatcher<{
    toggle: { expanded: boolean };
  }>();
</script>

<style>
  .expand {
    display: flex;
    background: none;
  }
</style>

<IconButton
  ariaLabel="expand"
  on:click={() => {
    expanded = !expanded;
    dispatch("toggle", { expanded });
  }}>
  <div class="expand">
    {#if expanded}
      <IconSmall name={variant === "inline" ? "ellipsis" : "chevron-down"} />
    {:else}
      <IconSmall name={variant === "inline" ? "ellipsis" : "chevron-right"} />
    {/if}
  </div>
</IconButton>
