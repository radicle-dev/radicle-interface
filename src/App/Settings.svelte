<script lang="ts">
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
</script>

<style>
  .settings {
    width: 18.5rem;
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

<div class="settings">
  <div class="item">
    <div>Theme</div>
    <div class="right">
      <Radio>
        <Button
          ariaLabel="Light Mode"
          styleBorderRadius="0"
          variant={$theme === "light" ? "gray-white" : "dim"}
          on:click={() => storeTheme("light")}>
          <Icon name="sun" />
        </Button>
        <Button
          ariaLabel="Dark Mode"
          styleBorderRadius="0"
          variant={$theme === "dark" ? "gray-white" : "dim"}
          on:click={() => storeTheme("dark")}>
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
            styleBorderRadius="0"
            styleFontFamily={font.fontFamily}
            on:click={() => storeCodeFont(font.storedName)}
            variant={$codeFont === font.storedName ? "gray-white" : "dim"}>
            {font.displayName}
          </Button>
        {/each}
      </Radio>
    </div>
  </div>
</div>
