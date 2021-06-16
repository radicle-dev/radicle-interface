<script lang="typescript">
  import { onMount } from 'svelte';
  import { createIcon } from '@app/blockies';
  import { isAddress } from '@app/utils';
  
  export let source: string;
  export let inline = false;
  export let glowOnHover = false;

  let container: HTMLElement;

  onMount(() => {
    if (isAddress(source)) {
      const seed = source.toLowerCase();
      const avatar = createIcon({
        seed,
        size: 8,
        scale: 16,
      });
      container.style.backgroundImage = `url(${avatar.toDataURL()})`;
    }
  });
</script>

<style>
  .avatar {
    border-radius: 50%;
    min-width: 1rem;
    min-height: 1rem;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-repeat: no-repeat;
  }
  .avatar.glowOnHover:hover {
    box-shadow: 0 0 3rem var(--color-secondary);
  }
  .inline {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    margin-right: 0.5rem;
  }
</style>

{#if isAddress(source)}
  <div class="avatar" class:inline bind:this={container} class:glowOnHover title={source}/>
{:else}
  <img class="avatar" class:inline src={source} class:glowOnHover alt="avatar"/>
{/if}
