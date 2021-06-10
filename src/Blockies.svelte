<script lang="typescript">
  import { onMount } from 'svelte';
  import { createIcon } from '@app/blockies';

  export let address: string;
  export let glowOnHover = false;

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
    min-width: 1rem;
    min-height: 1rem;
    background-size: cover;
    background-repeat: no-repeat;
    border-radius: 50%;
  }
  .icon.glowOnHover:hover {
    box-shadow: 0 0 3rem var(--color-secondary);
  }
</style>

<div class="icon" bind:this={container} class:glowOnHover title={address}></div>
