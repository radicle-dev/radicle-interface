<script lang="ts">
  import { navigate } from "svelte-routing";
  import { createEventDispatcher } from "svelte";

  export let size = 40;

  let input = "";

  const dispatch = createEventDispatcher();
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      dispatch("search");
      navigate(`/resolver/query?${new URLSearchParams({ q: input })}`);
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
</style>

<input
  {size}
  type="text"
  bind:value={input}
  on:keydown={handleKeydown}
  placeholder="Search a name or address…" />
