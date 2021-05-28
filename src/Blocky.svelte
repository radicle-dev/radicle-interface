<script lang="typescript">
  import { onMount } from 'svelte';
  import blockies from 'ethereum-blockies';

  export let address: string;

  let container: HTMLElement;

  onMount(() => {
    const seed = address;
    const avatar = blockies.create({
      seed,
      size: 8,
      scale: 16
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

<div class="icon" bind:this={container}>
</div>
