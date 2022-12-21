<script lang="ts">
  import View from "@app/views/seeds/View.svelte";

  export let host: string;
</script>

{#if host === "radicle.local"}
  <View hostAndPort={"0.0.0.0"} />
{:else}
  <View hostAndPort={host} />
{/if}
