<script lang="ts">
  import type { ComponentProps } from "svelte";

  import Icon from "./Icon.svelte";

  export let iconName: ComponentProps<Icon>["name"];
  export let iconSize: ComponentProps<Icon>["size"] = "48";
  export let caption: string;
  export let inline: boolean = false;
</script>

<style>
  .placeholder {
    align-items: center;
    text-align: center;
    color: var(--color-foreground-dim);
    display: flex;
    flex-direction: column;
    font-size: var(--font-size-small);
    gap: 0.5rem;
    justify-content: center;
  }
  .inline {
    flex-direction: row;
  }
</style>

<div class="placeholder" class:inline>
  <Icon name={iconName} size={iconSize} />
  {#each caption.split("\n") as line}
    {line}
    <br />
  {/each}
</div>
