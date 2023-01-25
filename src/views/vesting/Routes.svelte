<script lang="ts">
  import type { VestingRoute } from "@app/lib/router/definitions";

  import Form from "@app/views/vesting/Form.svelte";
  import Profile from "@app/views/profiles/Profile.svelte";

  export let activeRoute: VestingRoute;
</script>

{#if activeRoute.params.view.resource === "form"}
  <Form />
{:else if activeRoute.params.view.resource === "view"}
  <Profile addressOrName={activeRoute.params.view.params.contract} />
{/if}
