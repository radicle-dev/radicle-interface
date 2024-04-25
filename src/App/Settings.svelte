<script lang="ts">
  import { api, changeHttpdPort } from "@app/lib/httpd";
  import { config } from "@app/lib/config";
  import {
    codeFont,
    codeFonts,
    experimental,
    storeCodeFont,
    storeExperimental,
    storeTheme,
    theme,
  } from "@app/lib/appearance";

  import Icon from "@app/components/Icon.svelte";
  import Radio from "@app/components/Radio.svelte";
  import Button from "@app/components/Button.svelte";
  import TextInput from "@app/components/TextInput.svelte";

  $: customPort = api.port;
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
  <div class="item global-hide-on-mobile-down">
    <div
      style="display: flex; flex-direction: row; align-items: center; gap: 0.5rem;">
      Make changes on the web (experimental)
    </div>
    <div class="right">
      <Radio>
        <Button
          styleBorderRadius="0"
          on:click={() => storeExperimental(true)}
          variant={$experimental ? "selected" : "not-selected"}>
          On
        </Button>
        <div class="global-spacer" />
        <Radio>
          <Button
            styleBorderRadius="0"
            on:click={() => storeExperimental(undefined)}
            variant={$experimental ? "not-selected" : "selected"}>
            Off
          </Button>
        </Radio>
      </Radio>
    </div>
  </div>
  <div class="item">
    <div>Radicle HTTP Daemon Port</div>
    <div class="right txt-monospace" style:width="6rem">
      <TextInput
        name="httpd port"
        bind:value={customPort}
        placeholder={config.nodes.defaultLocalHttpdPort.toString()}
        valid={Number(customPort) >= 1 && Number(customPort) <= 65535}
        on:submit={() => changeHttpdPort(Number(customPort))} />
    </div>
  </div>
</div>
