<script lang="ts">
  import { onMount } from "svelte";
  import type { Route } from "@app/router";
  import { navigate } from "@app/router";

  export let to: Route;

  onMount(() => {
    navigate(to, { replace: true });
  });
</script>
