<script lang="ts">
  import Loading from "@app/Loading.svelte";

  type T = $$Generic;

  export let fetch: Promise<T>;
</script>

<style>
  .error {
    color: var(--color-negative);
    background-color: var(--color-negative-2);
    word-wrap: break-word;
    text-overflow: ellipsis;
    overflow-x: hidden;
    padding: 1rem;
  }
  .error::selection,
  .error ::selection {
    background-color: var(--color-negative);
  }
</style>

{#await fetch}
  <Loading center />
{:then result}
  <slot {result} />
{:catch err}
  <div class="error txt-tiny">
    <div>
      API request to <span class="txt-monospace">{err.url}</span>
      failed.
    </div>
  </div>
{/await}
