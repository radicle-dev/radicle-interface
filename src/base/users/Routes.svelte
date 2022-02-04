<script lang="ts">
  import { Route } from "svelte-routing";
  import View from "@app/base/users/View.svelte";
</script>

<Route path="/users/:addressOrName" let:params>
  <View addressOrName={params.addressOrName} />
</Route>
