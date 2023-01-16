<script lang="ts">
  import type { Route } from "@app/lib/router/definitions";

  import * as router from "@app/lib/router";
  import Loading from "@app/components/Loading.svelte";

  export let activeRoute: Extract<Route, { resource: "session" }>;

  async function createSession() {
    const { id, signature, publicKey } = activeRoute.params;

    const request = await fetch(`http://0.0.0.0:8080/api/v1/sessions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sig: signature, pk: publicKey }),
    });
    if (request.ok) {
      window.sessionStorage.setItem("session_id", id);
    }
    // We currently push once logged in users to the landing page,
    // we should trigger some notification to inform the user what happened
    router.push({ resource: "home" });
  }
</script>

{#await createSession()}
  <Loading center />
{/await}
