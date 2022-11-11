<!--
 @component
 ## Usage
 A `img` wrapper to provide additional functionality to display avatars  
 If the passed source isn't Address, URN or Peer ID it falls back to blockies
 
 ## Best Practices
 - The `grayscale` prop should be used for disabled things
 - THe `title` prop shouldn't be "avatar", since `alt` is already equal to `avatar`
 
 ## Error Handling
 - If the image source isn't found, we fallback to a blockie
 
 ## Props
 @param title - The `image` `title` attribute
 @param source - The `image` `src` attribute
 @param inline - Changes the `image` element from `display: block` to `inline-block`
 @param grayscale - Converts the avatar image to grayscale, used for a disabled look
-->
<script lang="ts">
  import { createIcon } from "@app/blockies";
  import { isAddress, isPeerId, isRadicleId } from "@app/utils";

  export let title: string;
  export let source: string;
  export let inline = false;
  export let grayscale = false;

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

<img
  {title}
  src={source}
  class="avatar"
  alt="avatar"
  on:error={handleMissingFile}
  class:inline
  class:grayscale />
