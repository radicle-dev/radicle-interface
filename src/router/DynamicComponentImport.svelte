<script lang="ts">
  import type { SvelteComponent } from "svelte";

  export let path: string;

  // TODO: Eventually we can restrict this glob pattern to the few components we need to import dynamically
  const modules = import.meta.glob<boolean, string, SvelteComponent>(
    "../**/*.svelte",
  );
</script>

<!-- We try to resolve the import promise to a component to be rendered -->
{#await modules[path]() then component}
  <svelte:component this={component.default} {...$$props} />
{/await}
