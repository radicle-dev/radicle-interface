<script lang="ts">
  import { createIcon } from '@app/blockies';
  import { isAddress, isRadicleId } from '@app/utils';

  export let address: string;
  export let source: string;
  export let inline = false;
  export let glowOnHover = false;

  function handleMissingFile() {
    source = createContainer(address);
  }

  function createContainer(source: string) {
    const seed = source.toLowerCase();
    const avatar = createIcon({
      seed,
      size: 8,
      scale: 16,
    });
    return avatar.toDataURL();
  }

  $: if (isAddress(source) || isRadicleId(source)) {
    source = createContainer(source);
  }
</script>

<style>
  .avatar {
    display: block;
    border-radius: 50%;
    min-width: 1rem;
    min-height: 1rem;
    height: 100%;
    background-size: cover;
    background-repeat: no-repeat;
  }
  .avatar.glowOnHover:hover {
    box-shadow: 0 0 3rem var(--color-secondary);
  }
  .inline {
    display: inline-block !important;
    width: 1rem;
    height: 1rem;
    margin-right: 0.5rem;
  }
</style>

<!-- svelte-ignore a11y-missing-attribute -->
<img class="avatar" class:inline src={source} title={address} on:error={handleMissingFile} class:glowOnHover />
