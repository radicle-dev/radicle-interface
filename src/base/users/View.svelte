<script lang="ts">
  import Loading from '@app/Loading.svelte';
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';

  export let addressOrName: string;

  onMount(() => {
    navigate(`/${addressOrName}`);
  })
</script>

<Loading center />
