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
  let linkIcon: "link" | "checkmark" = "link";
  let shareIcon: "share" | "checkmark" = "share";

  const restoreIcon = debounce(() => {
    linkIcon = "link";
    shareIcon = "share";
  }, 800);

  async function copy(text: string) {
    await toClipboard(text);
    linkIcon = "checkmark";
    shareIcon = "checkmark";
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
      <IconSmall name={linkIcon} />
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
    <IconSmall name={shareIcon} />
    {shareIcon === "share" ? "Share" : "Link copied"}
  </Button>
{/if}
