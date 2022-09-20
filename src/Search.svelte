<script lang="ts">
  import { resolve, ResolvedSearch } from "@app/resolver";
  import type { Config } from "@app/config";
  import { createEventDispatcher } from "svelte";
  import Loading from "@app/Loading.svelte";
  import TextInput from "@app/TextInput.svelte";

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
      dispatch("finished");
    }
  };
</script>

<TextInput
  variant="dashed"
  bind:value={input}
  on:keydown={handleKeydown}
  placeholder="Search a name or address…">
  <svelte:fragment slot="right">
    {#if searching}
      <Loading small />
    {/if}
  </svelte:fragment>
</TextInput>
