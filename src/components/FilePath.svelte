<script lang="ts">
  export let filenameWithPath: string;

  $: path = filenameWithPath
    .match(/^.*\/|/)
    ?.values()
    .next().value;

  $: filename = filenameWithPath.split("/").slice(-1);
</script>

<style>
  .file-path {
    font-size: var(--font-size-small);
    white-space: nowrap;
  }

  .path {
    color: var(--color-fill-gray);
    font-weight: var(--font-weight-regular);
  }

  .filename {
    font-weight: var(--font-weight-semibold);
  }
</style>

<!-- prettier-ignore -->
<span class="file-path"><span class="path">{path}</span><span class="filename">{filename}</span></span>
