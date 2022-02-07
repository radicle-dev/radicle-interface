<script lang="ts">
  import { Route } from "svelte-routing";
  import Redirect from "@app/Redirect.svelte";
</script>

<Route path="/users/:addressOrName" let:params>
  <Redirect to="/{params.addressOrName}" />
</Route>
