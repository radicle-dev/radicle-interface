<script lang="ts">
  import type { Config } from "@app/config";

  import { createEventDispatcher } from "svelte";
  import debounce from "lodash/debounce";

  import { resolve } from "@app/resolver";
  import Loading from "@app/Loading.svelte";
  import TextInput from "@app/TextInput.svelte";

  export let config: Config;

  let input = "";
  let searching = false;
  let shake = false;

  const dispatch = createEventDispatcher();
  const handleKeydown = async (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      searching = true;
      resolve(input, config)
        .then(results => {
          const query = input;
          input = "";
          searching = false;
          if (results) dispatch("search", { query, results });
        })
        .catch(() => {
          searching = false;
          shake = true;
          debounce(() => (shake = false), 500)();
          dispatch("finished");
        });
    }
  };
</script>

<style>
  .horizontal-shake {
    animation: horizontal-shaking 0.35s;
  }
  @keyframes horizontal-shaking {
    0% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(5px);
    }
    50% {
      transform: translateX(-5px);
    }
    75% {
      transform: translateX(5px);
    }
    100% {
      transform: translateX(0);
    }
  }
</style>

<div class:horizontal-shake={shake}>
  <TextInput
    variant="dashed"
    disabled={searching}
    bind:value={input}
    on:keydown={handleKeydown}
    placeholder="Search a name or address…">
    <svelte:fragment slot="right">
      {#if searching}
        <Loading small />
      {/if}
    </svelte:fragment>
  </TextInput>
</div>
