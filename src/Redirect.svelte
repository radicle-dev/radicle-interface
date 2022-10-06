<script>
  import { navigate } from "svelte-routing";
  import { onMount } from "svelte";

  export let to;

  onMount(() => {
    navigate(to, { replace: true });
  });
</script>
