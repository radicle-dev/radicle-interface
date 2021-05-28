<script lang="typescript">
  import { onMount } from 'svelte';
  import { createIcon } from '@app/blockies';

  export let address: string;

  let container: HTMLElement;

  onMount(() => {
    const seed = address.toLowerCase();
    const avatar = createIcon({
      seed,
      size: 8,
      scale: 16,
    });
    container.style.backgroundImage = `url(${avatar.toDataURL()})`;
  });
</script>

<style>
  .icon {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-repeat: no-repeat;
    border-radius: 50%;
  }
</style>

<div class="icon" bind:this={container}></div>
