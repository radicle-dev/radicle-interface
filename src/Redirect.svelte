<script>
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";

  export let to;

  onMount(() => {
    navigate(to, { replace: true });
  });
</script>
