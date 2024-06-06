<script lang="ts">
  import type { BaseUrl } from "@http-client";

  import debounce from "lodash/debounce";
  import { api, httpdStore } from "@app/lib/httpd";
  import { isLocal, toClipboard } from "@app/lib/utils";
  import config from "virtual:config";

  import Button from "@app/components/Button.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Popover from "@app/components/Popover.svelte";
  import ShareButton from "./Header/ShareButton.svelte";

  export let baseUrl: BaseUrl;

  const caption = "Link to seed";
  let shareIcon: "link" | "checkmark" = "link";
  let loading = false;

  const restoreIcon = debounce(() => {
    shareIcon = "link";
  }, 1000);

  async function copy() {
    if (loading) {
      return;
    }
    try {
      loading = true;
      const profile = await api.profile.getProfile().catch(() => undefined);
      const publicExplorer =
        profile?.config.publicExplorer ?? config.nodes.fallbackPublicExplorer;
      const text = new URL(publicExplorer).origin.concat(
        window.location.pathname,
      );
      await toClipboard(text);
      shareIcon = "checkmark";
    } finally {
      loading = false;
    }
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
      <IconSmall name="link" />
      <span class="global-hide-on-small-desktop-down">
        {caption}
      </span>
    </Button>
    <ShareButton slot="popover" />
  </Popover>
{:else}
  <Button variant="outline" size="regular" on:click={copy}>
    <IconSmall name={shareIcon} />
    <span class="global-hide-on-small-desktop-down">Copy link</span>
  </Button>
{/if}
