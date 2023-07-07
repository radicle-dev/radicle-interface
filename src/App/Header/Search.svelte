<script lang="ts" strictEvents>
  import debounce from "lodash/debounce";
  import { createEventDispatcher } from "svelte";

  import * as Search from "@app/lib/search";
  import * as modal from "@app/lib/modal";
  import * as router from "@app/lib/router";
  import { searchPlaceholder } from "@app/lib/shared";
  import { unreachable } from "@app/lib/utils";

  import Icon from "@app/components/Icon.svelte";
  import SearchResultsModal from "@app/App/Header/SearchResultsModal.svelte";
  import TextInput from "@app/components/TextInput.svelte";

  const dispatch = createEventDispatcher<{
    finished: null;
  }>();

  export let input = "";

  let loading = false;
  let shaking = false;
  let expanded = false;

  // Clears search input on user navigation.
  router.activeRouteStore.subscribe(() => (input = ""));

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
      shake();
    } else if (searchResult.type === "projects") {
      input = "";
      if (searchResult.results.length === 1) {
        const { project, baseUrl } = searchResult.results[0];
        void router.push({
          resource: "projects",
          params: {
            view: { resource: "tree" },
            id: project.id,
            peer: undefined,
            baseUrl,
            hash: undefined,
          },
        });
      } else {
        modal.show({
          component: SearchResultsModal,
          props: {
            results: searchResult.results,
            query,
          },
        });
      }
      dispatch("finished");
      expanded = false;
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
  .search {
    transition: all 0.2s;
    width: 11rem;
  }
  .expanded {
    width: 25.5rem;
  }
  @media (max-width: 720px) {
    .expanded {
      width: 11rem;
    }
  }
</style>

<div class="search" class:expanded>
  <div class="search-bar" class:shaking>
    <TextInput
      valid={input !== ""}
      {loading}
      disabled={loading}
      bind:value={input}
      on:focus={() => (expanded = true)}
      on:blur={() => {
        if (input === "") expanded = false;
      }}
      on:submit={search}
      placeholder={searchPlaceholder}>
      <svelte:fragment slot="left">
        <Icon name="magnifying-glass" />
      </svelte:fragment>
    </TextInput>
  </div>
</div>
