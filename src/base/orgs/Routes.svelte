<script lang="ts">
  import { Route } from "svelte-routing";
  import Redirect from "@app/Redirect.svelte";
  import NotFound from "@app/NotFound.svelte";
</script>

<Route path="/orgs">
  <NotFound
    title="404"
    subtitle="Radicle Orgs are in the process of being re-designed." />
</Route>

<Route path="/orgs/:addressOrName" let:params>
  <Redirect to="/{params.addressOrName}" />
</Route>
