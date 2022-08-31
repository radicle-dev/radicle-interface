<script lang="ts">
  import Loading from "@app/Loading.svelte";

  export let fetch: any;
</script>

{#await fetch}
  <Loading center />
{:then result}
  <slot {result} />
{:catch err}
  <div class="commit">
    <div class="error error-message text-xsmall">
      <div>
        API request to <code class="text-xsmall">{err.url}</code>
        failed.
      </div>
    </div>
  </div>
{/await}
