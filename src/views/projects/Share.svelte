<script lang="ts">
  import type { BaseUrl } from "@http-client";

  import config from "virtual:config";
  import debounce from "lodash/debounce";
  import { HttpdClient } from "@http-client";
  import { toClipboard } from "@app/lib/utils";

  import Button from "@app/components/Button.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";

  export let baseUrl: BaseUrl;

  let shareIcon: "link" | "checkmark" = "link";
  let loading = false;

  const restoreIcon = debounce(() => {
    shareIcon = "link";
  }, 1000);

  $: api = new HttpdClient(baseUrl);

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

<Button
  variant="outline"
  size="regular"
  on:click={async () => {
    await copy();
  }}>
  <IconSmall name={shareIcon} />
  <span class="global-hide-on-small-desktop-down">Copy link</span>
</Button>
