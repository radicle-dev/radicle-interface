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
  import Radio from "@app/components/Radio.svelte";
  import Button from "@app/components/Button.svelte";

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
    display: flex;
    flex-direction: column;
    align-items: center;
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
</style>

<div class="container">
  <div class="item">
    <div>Theme</div>
    <div class="right">
      <Radio>
        <Button
          ariaLabel="Light Mode"
          square
          variant={$theme === "light" ? "secondary" : "gray"}
          on:click={() => switchTheme("light")}>
          <Icon name="sun" />
        </Button>
        <Button
          ariaLabel="Dark Mode"
          square
          variant={$theme === "dark" ? "secondary" : "gray"}
          on:click={() => switchTheme("dark")}>
          <Icon name="moon" />
        </Button>
      </Radio>
    </div>
  </div>
  <div class="item">
    <div>Code Font</div>
    <div class="right">
      <Radio>
        {#each codeFonts as font}
          <Button
            square
            styleFontFamily={font.fontFamily}
            on:click={() => switchFont(font.storedName)}
            variant={$codeFont === font.storedName ? "secondary" : "gray"}>
            {font.displayName}
          </Button>
        {/each}
      </Radio>
    </div>
  </div>
</div>
