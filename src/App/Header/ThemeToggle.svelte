<script lang="ts">
  import Icon from "@app/components/Icon.svelte";
  import Toggle from "@app/components/Toggle.svelte";
  import { theme, storeTheme } from "@app/lib/appearance";

  $: document.documentElement.setAttribute("data-theme", $theme);
</script>

<style>
  .theme {
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
    gap: 0.5rem;
    cursor: pointer;
  }
</style>

<div class="theme">
  <Icon name="sun" on:click={() => theme.set("light")} />
  <Toggle
    checked={$theme === "dark"}
    on:change={() => {
      theme.set($theme === "dark" ? "light" : "dark");
      storeTheme($theme);
    }} />
  <Icon name="moon" on:click={() => theme.set("dark")} />
</div>
