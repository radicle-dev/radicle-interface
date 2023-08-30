<script lang="ts">
  import type { CodeFont, Theme } from "@app/lib/appearance";

  import {
    codeFont,
    codeFonts,
    storeCodeFont,
    storeTheme,
    theme,
  } from "@app/lib/appearance";

  import Icon from "@app/components/Icon.svelte";

  $: document.documentElement.setAttribute("data-codefont", $codeFont);
  $: document.documentElement.setAttribute("data-theme", $theme);

  function switchFont(font: CodeFont) {
    codeFont.set(font);
    storeCodeFont(font);
  }

  function switchTheme(newTheme: Theme) {
    theme.set(newTheme);
    storeTheme(newTheme);
  }
</script>

<style>
  .container {
    position: absolute;
    top: 4.5rem;
    right: 1.5rem;
    width: 22rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: var(--color-background-float);
    border: 1px solid var(--color-border-hint);
    border-radius: var(--border-radius-regular);
    box-shadow: var(--elevation-low);
    padding: 1rem;
    gap: 1.5rem;
    font-size: var(--font-size-small);
  }

  .item {
    display: flex;
    width: 100%;
    align-items: center;
  }

  .right {
    display: flex;
    margin-left: auto;
  }

  .radio {
    display: flex;
    border: 1px solid var(--color-fill-secondary);
    border-radius: var(--border-radius-small);
    height: 2rem;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }

  button {
    cursor: pointer;
    padding: 0 0.75rem;
    display: flex;
    height: 100%;
    align-items: center;
    color: var(--color-fill-secondary);
    border: none;
    background-color: var(--color-background-default);
  }

  button:hover {
    background-color: var(--color-fill-ghost);
  }

  .active {
    background-color: var(--color-fill-secondary);
    color: var(--color-foreground-black);
  }

  .active:hover {
    background-color: var(--color-fill-secondary-hover);
  }
</style>

<div class="container">
  <div class="item">
    <div>Theme</div>
    <div class="right">
      <div class="radio">
        <button
          aria-label="Light Mode"
          class:active={$theme === "light"}
          on:click={() => switchTheme("light")}>
          <Icon name="sun" />
        </button>
        <button
          aria-label="Dark Mode"
          class:active={$theme === "dark"}
          on:click={() => switchTheme("dark")}>
          <Icon name="moon" />
        </button>
      </div>
    </div>
  </div>
  <div class="item">
    <div>Code Font</div>
    <div class="right">
      <div class="radio">
        {#each codeFonts as font}
          <button
            on:click={() => switchFont(font.storedName)}
            class:active={$codeFont === font.storedName}
            style:font-family={font.fontFamily}>
            {font.displayName}
          </button>
        {/each}
      </div>
    </div>
  </div>
</div>
