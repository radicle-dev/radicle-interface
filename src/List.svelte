<script lang="ts">
  import Button from "@app/Button.svelte";
  import Loading from "@app/Loading.svelte";
  import { fade } from "svelte/transition";

  type Item = $$Generic;

  export let items: Item[];
  export let query: () => Promise<Item[]>;
  export let complete = false;

  // Used to handle the display of the trigger to load more items, according to the current loading state.
  let loading = false;

  const transitionParams = { duration: 200 };

  const fetchMore = async () => {
    loading = true;
    const response = await query();

    if (response.length > 0) {
      items = [...items, ...response];
    } else {
      complete = true;
    }

    loading = false;
  };
</script>

<style>
  .more {
    margin-top: 2rem;
    text-align: center;
  }
</style>

<slot name="list" {items} />
{#if !complete}
  <slot name="more" {fetchMore} {loading}>
    {#if loading}
      <div class="more" transition:fade|local={transitionParams}>
        <Loading small />
      </div>
    {:else}
      <div class="more" transition:fade|local={transitionParams}>
        <Button
          variant="foreground"
          waiting={loading}
          disabled={loading}
          on:click={fetchMore}>
          More
        </Button>
      </div>
    {/if}
  </slot>
{/if}
