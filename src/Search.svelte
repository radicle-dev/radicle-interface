<script lang="ts">
  import { resolve, ResolvedSearch } from "@app/resolver";
  import type { Config } from "@app/config";
  import { createEventDispatcher } from "svelte";
  import Loading from "@app/Loading.svelte";

  export let size = 40;
  export let config: Config;

  let input = "";
  let searching = false;
  let results: ResolvedSearch | null;

  const dispatch = createEventDispatcher();
  const handleKeydown = async (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      searching = true;
      results = await resolve(input, config);
      if (results) {
        dispatch("search", { query: input, results });
      }
      input = "";
      searching = false;
    }
  };
</script>

<style>
  input {
    height: 100%;
    width: 100%;
    font-size: var(--font-size-small);
    text-overflow: ellipsis;
    margin: 0;
    padding: 0.5rem 1.25rem;
    border-style: dashed;
    height: var(--button-regular-height);
  }
  input[disabled] {
    color: var(--color-secondary);
  }
  .wrapper {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .loading {
    position: absolute;
    right: 12px;
  }
</style>

<div class="wrapper">
  <input
    {size}
    type="text"
    disabled={searching}
    bind:value={input}
    on:keydown={handleKeydown}
    placeholder="Search a name or address…" />
  {#if searching}
    <div class="loading">
      <Loading small />
    </div>
  {/if}
</div>
