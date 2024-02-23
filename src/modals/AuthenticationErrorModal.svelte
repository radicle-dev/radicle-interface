<script lang="ts">
  import { baseUrlToString } from "@app/lib/utils";
  import * as httpd from "@app/lib/httpd";

  import Modal from "@app/components/Modal.svelte";
  import Icon from "@app/components/Icon.svelte";

  // @ts-expect-error https://github.com/microsoft/TypeScript/issues/41532
  const isBrave = navigator.brave !== undefined;
  const url = baseUrlToString(httpd.api.baseUrl);
</script>

<Modal title="Authentication failed" showCloseButton>
  <Icon name="alert" size="48" slot="icon" />

  <div slot="subtitle">
    Make sure your browser is able to connect to <a href={url}>{url}</a>
    &#x200B.

    <br />

    {#if isBrave}
      It seems like you're using Brave browser, to make authentication work, <br />
      disable trackers and ad blockers in settings/shields.
    {:else}
      Firewalls and ad blockers can interfere with authentication, <br />
      try disabling them and try again.
    {/if}

    <br />
    <br />
    If the above doesn't help, check for errors in the browser console and
    <br />
    in the terminal where you ran the auth command.
  </div>
</Modal>
