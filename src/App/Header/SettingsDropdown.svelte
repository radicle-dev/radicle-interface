<script lang="ts">
  import type { CodeFont } from "@app/lib/appearance";

  import Icon from "@app/components/Icon.svelte";
  import ThemeToggle from "./ThemeToggle.svelte";
  import { codeFont, storeCodeFont } from "@app/lib/appearance";
  import { codeFonts } from "@app/lib/appearance";
  import { quadIn } from "svelte/easing";
  import { slide } from "svelte/transition";

  let showFonts = false;

  $: document.documentElement.setAttribute("data-codefont", $codeFont);

  const switchFont = (font: CodeFont) => {
    codeFont.set(font);
    storeCodeFont(font);
  };
</script>

<style>
  .dropdown {
    position: absolute;
    top: 5rem;
    right: 1.5rem;
    width: 16.5rem;
    background: var(--color-foreground-1);
    border-radius: var(--border-radius);
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--color-foreground-6);
    box-shadow: var(--elevation-low);
  }
  .dropdown:hover :last-child {
    border-bottom-left-radius: var(--border-radius);
    border-bottom-right-radius: var(--border-radius);
  }
  .item {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: 2.5rem;
    padding: 0 0.8rem;
    font-weight: 600;
    line-height: 2.5rem;
    user-select: none;
  }
  .item:first-of-type {
    border-bottom: 1px solid var(--color-foreground-3);
  }
  .selector {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
  }
  .fonts {
    width: 100%;
  }
  .fonts > .item {
    border-bottom: none;
  }
  .font {
    color: var(--color-foreground-5);
    cursor: pointer;
  }
  .font:last-of-type {
    border-bottom-left-radius: var(--border-radius);
    border-bottom-right-radius: var(--border-radius);
  }
  .selector:hover {
    background-color: var(--color-foreground-3);
    color: var(--color-foreground-6);
  }
  .font:hover {
    background-color: var(--color-foreground-3);
    color: var(--color-foreground-5);
  }
  .active,
  .active:hover {
    color: var(--color-foreground-6);
  }
</style>

<div class="dropdown">
  <div class="item">
    <span>Theme</span>
    <ThemeToggle />
  </div>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    class="item selector"
    on:click|stopPropagation={() => (showFonts = !showFonts)}>
    <div>Code font</div>
    <Icon name={`chevron-${showFonts ? "up" : "down"}`} />
  </div>
  {#if showFonts}
    <div
      class="fonts"
      transition:slide|local={{ duration: 150, easing: quadIn }}>
      {#each codeFonts as font}
        {@const isSelectedFont = $codeFont === font.storedName}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
          on:click={() => switchFont(font.storedName)}
          class="item font"
          class:active={isSelectedFont}
          style:font-family={font.fontFamily}>
          {font.displayName}
          {#if isSelectedFont}
            <Icon name="checkmark" />
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
