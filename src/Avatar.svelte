<script lang="ts">
  import { createIcon } from "@app/blockies";
  import { isAddress, isPeerId, isRadicleId } from "@app/utils";

  export let grayscale = false;
  export let inline = false;
  export let source: string;
  export let title: string;

  function handleMissingFile() {
    console.warn("Not able to locate", source);
    source = createContainer(title);
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

  if (isAddress(source) || isRadicleId(source) || isPeerId(source)) {
    source = createContainer(source);
  }
  grayscale = isPeerId(title) || isRadicleId(title);
</script>

<style>
  .avatar {
    display: block;
    border-radius: var(--border-radius-round);
    min-width: 1rem;
    min-height: 1rem;
    height: 100%;
    width: inherit;
    object-fit: cover;
    background-size: cover;
    background-repeat: no-repeat;
  }
  .grayscale {
    filter: grayscale();
  }
  .inline {
    display: inline-block !important;
    width: 1rem;
    height: 1rem;
    margin-right: 0.5rem;
  }
</style>

<!-- svelte-ignore a11y-missing-attribute -->
<img
  {title}
  src={source}
  class="avatar"
  on:error={handleMissingFile}
  class:inline
  class:grayscale />
