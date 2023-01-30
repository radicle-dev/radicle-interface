<script lang="ts" strictEvents>
  import debounce from "lodash/debounce";
  import { createEventDispatcher } from "svelte";
  import * as router from "@app/lib/router";

  import * as Search from "@app/lib/search";
  import * as modal from "@app/lib/modal";
  import SearchResultsModal from "@app/App/Header/SearchResultsModal.svelte";
  import TextInput from "@app/components/TextInput.svelte";
  import { unreachable } from "@app/lib/utils";

  const dispatch = createEventDispatcher<{
    finished: never;
  }>();

  let input = "";
  let loading = false;
  let shaking = false;

  // Clears search input on user navigation.
  router.historyStore.subscribe(() => (input = ""));

  function shake() {
    shaking = true;
    debounce(() => (shaking = false), 500)();
  }

  async function search() {
    if (!valid) {
      return;
    }

    loading = true;

    const query = input;
    const searchResult = await Search.searchProjectsAndProfiles(input);

    if (searchResult.type === "nothing") {
      shake();
    } else if (searchResult.type === "error") {
      // TODO: show some kind of notification to the user.
      shake();
    } else if (searchResult.type === "projects") {
      input = "";
      if (searchResult.projects.length === 1) {
        router.push({
          resource: "projects",
          params: {
            view: { resource: "tree" },
            id: searchResult.projects[0].info.id,
            peer: undefined,
            seed: searchResult.projects[0].seed.host,
            hash: undefined,
            search: undefined,
          },
        });
      } else {
        modal.show({
          component: SearchResultsModal,
          props: {
            results: searchResult.projects,
            query,
          },
        });
      }
      dispatch("finished");
    } else {
      unreachable(searchResult);
    }
    loading = false;
  }

  $: valid = input !== "";
</script>

<style>
  .search-bar {
    display: flex;
  }
  .shaking {
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

<div class="search-bar" class:shaking>
  <TextInput
    variant="dashed"
    valid={input !== ""}
    {loading}
    disabled={loading}
    bind:value={input}
    on:submit={search}
    placeholder="Search a name or address…" />
</div>
