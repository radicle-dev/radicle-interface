<script lang="ts" context="module">
  export type Theme = "dark" | "light";

  import { writable } from "svelte/store";

  export const theme = writable<Theme>(loadTheme());

  function storeTheme(theme: Theme): void {
    window.localStorage.setItem("theme", theme);
  }

  function loadTheme(): Theme {
    const storedTheme = window.localStorage.getItem("theme");

    if (storedTheme === null) {
      return "dark";
    } else {
      return storedTheme as Theme;
    }
  }
</script>

<script lang="ts">
  import Icon from "@app/Icon.svelte";
  import Toggle from "@app/Toggle.svelte";

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
