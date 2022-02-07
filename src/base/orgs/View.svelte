<script lang="ts">
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import Loading from '@app/Loading.svelte';

  export let addressOrName: string;

  onMount(() => {
    navigate(`/${addressOrName}`);
  });
</script>
  
<Loading center />
