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
    gap: 2rem;
    white-space: nowrap;
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
          variant={$theme === "light" ? "selected" : "not-selected"}
          on:click={() => storeTheme("light")}>
          <Icon name="sun" />
        </Button>
        <div class="global-spacer" />
        <Button
          ariaLabel="Dark Mode"
          styleBorderRadius="0"
          variant={$theme === "dark" ? "selected" : "not-selected"}
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
            variant={$codeFont === font.storedName
              ? "selected"
              : "not-selected"}>
            {font.displayName}
          </Button>
          <div class="global-spacer" />
        {/each}
      </Radio>
    </div>
  </div>
</div>
