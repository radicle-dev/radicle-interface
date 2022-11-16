<script lang="ts">
  export let path: string;
</script>

{#await import(path) then component}
  <svelte:component this={component.default} {...$$props} />
{/await}
