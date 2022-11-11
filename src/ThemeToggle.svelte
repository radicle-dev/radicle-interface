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

  $: document.documentElement.setAttribute("data-theme", $theme);
</script>

<style>
  .theme-button {
    border-radius: 50%;
    border: 1px solid var(--color-foreground);
    color: var(--color-foreground);
    cursor: pointer;
    display: flex;
    height: 40px;
    width: 40px;
    justify-content: center;
    align-items: center;
    user-select: none;
  }

  .theme-button:hover,
  .theme-button:focus-visible {
    color: var(--color-background);
    background-color: var(--color-foreground);
    border-color: transparent;
  }
</style>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="theme-button"
  tabindex="0"
  role="button"
  on:keydown={e => {
    if (e.code === "Enter") {
      theme.set($theme === "dark" ? "light" : "dark");
      storeTheme($theme);
    }
  }}
  on:click={() => {
    theme.set($theme === "dark" ? "light" : "dark");
    storeTheme($theme);
  }}>
  {#if $theme === "dark"}
    <Icon name="sun" />
  {:else}
    <Icon name="moon" />
  {/if}
</div>
