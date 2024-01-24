<script lang="ts">
  import type { BaseUrl } from "@httpd-client";

  import debounce from "lodash/debounce";
  import { httpdStore } from "@app/lib/httpd";
  import { isLocal, toClipboard } from "@app/lib/utils";

  import Button from "@app/components/Button.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Popover from "@app/components/Popover.svelte";
  import ShareButton from "./Header/ShareButton.svelte";

  export let preferredSeeds: string[];
  export let publicExplorer: string;
  export let baseUrl: BaseUrl;

  const caption = "Link to seed";
  let icon: "link" | "checkmark" = "link";

  const restoreIcon = debounce(() => {
    icon = "link";
  }, 800);

  async function copy(text: string) {
    await toClipboard(text);
    icon = "checkmark";
    restoreIcon();
  }
</script>

{#if $httpdStore.state !== "stopped" && isLocal(baseUrl.hostname)}
  <Popover
    popoverPadding="1rem"
    popoverPositionTop="2.5rem"
    popoverPositionRight="0">
    <Button
      variant="outline"
      size="regular"
      slot="toggle"
      let:toggle
      on:click={toggle}>
      <IconSmall name={icon} />
      {caption}
    </Button>
    <ShareButton {publicExplorer} {preferredSeeds} slot="popover" />
  </Popover>
{:else}
  <Button
    variant="outline"
    size="regular"
    on:click={() =>
      void copy(
        new URL(publicExplorer).origin.concat(window.location.pathname),
      )}>
    <IconSmall name={icon} />
    {caption}
  </Button>
{/if}
