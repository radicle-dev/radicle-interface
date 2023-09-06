<script lang="ts">
  import type { HttpdState } from "@app/lib/httpd";

  import * as httpd from "@app/lib/httpd";
  import { closeFocused } from "@app/components/Floating.svelte";
  import { httpdStore } from "@app/lib/httpd";

  import Authorship from "@app/components/Authorship.svelte";
  import Button from "@app/components/Button.svelte";
  import Clipboard from "@app/components/Clipboard.svelte";
  import Command from "@app/components/Command.svelte";
  import Floating from "@app/components/Floating.svelte";
  import FloatingModal from "@app/components/FloatingModal.svelte";
  import Icon from "@app/components/Icon.svelte";
  import Link from "@app/components/Link.svelte";
  import TextInput from "@app/components/TextInput.svelte";

  $: customUrl = `${httpd.api.baseUrl.scheme}://${httpd.api.baseUrl.hostname}:${customPort}`;
  $: command = import.meta.env.PROD
    ? `rad web --backend ${customUrl}`
    : `rad web --frontend ${
        new URL(import.meta.url).origin
      } --backend ${customUrl}`;

  let customPort = httpd.api.port;
  const buttonTitle: Record<HttpdState["state"], string> = {
    stopped: "radicle-httpd is stopped",
    running: "radicle-httpd is running",
    authenticated: "radicle-httpd is running - signed in",
  };

  $: validPortNumber = Number(customPort) > 0 && Number(customPort) <= 65535;
</script>

<style>
  .running {
    color: var(--color-fill-secondary);
  }
  .authenticated {
    color: var(--color-fill-success);
  }
</style>

<Floating>
  <Button
    stylePadding="0 1rem 0 0.5rem"
    slot="toggle"
    title={buttonTitle[$httpdStore.state]}
    size="large"
    variant="outline">
    <div
      class:authenticated={$httpdStore.state === "authenticated"}
      class:stopped={$httpdStore.state === "stopped"}
      class:running={$httpdStore.state === "running"}>
      <Icon name="network" />
    </div>
    radicle.local
  </Button>

  <FloatingModal slot="modal" style="top: 4.5rem; right: 5rem; width: 20.5rem;">
    {#if $httpdStore.state === "authenticated"}
      <Authorship authorId={$httpdStore.session.publicKey} />
      <Clipboard text={$httpdStore.session.publicKey} small />

      <Link
        on:afterNavigate={closeFocused}
        route={{
          resource: "nodes",
          params: {
            baseUrl: httpd.api.baseUrl,
            projectPageIndex: 0,
          },
        }}>
        <Button size="small" variant="outline">Browse</Button>
      </Link>

      <Button
        size="small"
        variant="outline"
        on:click={() => {
          void httpd.disconnect();
          closeFocused();
        }}>
        Disconnect
      </Button>
    {:else if $httpdStore.state === "running"}
      To connect to your local Radicle node, run this command in your terminal:
      <Command {command} />
      Port:
      <TextInput
        name="port"
        size="small"
        variant="modal"
        bind:value={customPort}
        valid={validPortNumber}
        on:submit={() => httpd.changeHttpdPort(Number(customPort))} />
      <Link
        on:afterNavigate={closeFocused}
        route={{
          resource: "nodes",
          params: {
            baseUrl: httpd.api.baseUrl,
            projectPageIndex: 0,
          },
        }}>
        <Button size="small" variant="outline">Browse</Button>
      </Link>
    {:else}
      To access your local Radicle node on this site, run this command in your
      terminal:
      <Command command="radicle-httpd" />
      Port:
      <TextInput
        name="port"
        size="small"
        variant="modal"
        bind:value={customPort}
        valid={validPortNumber}
        on:submit={() => httpd.changeHttpdPort(Number(customPort))} />
    {/if}
  </FloatingModal>
</Floating>
