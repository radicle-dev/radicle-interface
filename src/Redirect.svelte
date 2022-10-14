<script lang="ts">
  import type { Route } from "@app/router/definitions";

  import { onMount } from "svelte";
  import { navigate } from "@app/router";

  export let to: Route;

  onMount(() => {
    navigate(to, { replace: true });
  });
</script>
