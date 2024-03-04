<script lang="ts">
  import type { BaseUrl } from "@httpd-client";

  import debounce from "lodash/debounce";
  import { api, httpdStore } from "@app/lib/httpd";
  import { isLocal, toClipboard } from "@app/lib/utils";
  import { config } from "@app/lib/config";

  import Button from "@app/components/Button.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Popover from "@app/components/Popover.svelte";
  import ShareButton from "./Header/ShareButton.svelte";
  import Loading from "@app/components/Loading.svelte";

  export let baseUrl: BaseUrl;

  const caption = "Link to seed";
  let shareIcon: "share" | "checkmark" = "share";
  let loading = false;

  const restoreIcon = debounce(() => {
    shareIcon = "share";
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
      {caption}
    </Button>
    <ShareButton slot="popover" />
  </Popover>
{:else}
  <Button variant="outline" size="regular" on:click={copy}>
    {#if loading}
      <Loading small noDelay />
    {:else}
      <IconSmall name={shareIcon} />
      Share
    {/if}
  </Button>
{/if}
