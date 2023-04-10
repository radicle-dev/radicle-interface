<script lang="ts">
  import { createIcon } from "@app/lib/blockies";

  export let nodeId: string;
  export let inline = false;

  function createContainer(source: string) {
    source = source.replace("did:key:", "");
    const seed = source.toLowerCase();
    const avatar = createIcon({
      seed,
      size: 8,
      scale: 16,
    });
    return avatar.toDataURL();
  }
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
  .inline {
    display: inline-block !important;
    width: 1rem;
    height: 1rem;
    margin-right: 0.5rem;
  }
</style>

<img
  title={nodeId}
  src={createContainer(nodeId)}
  class="avatar"
  alt="avatar"
  class:inline />
