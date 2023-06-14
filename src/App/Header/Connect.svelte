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
  import Icon from "@app/components/Icon.svelte";
  import Link from "@app/components/Link.svelte";
  import PortInput from "@app/App/Header/Connect/PortInput.svelte";

  $: command = import.meta.env.PROD
    ? `rad web --backend ${httpd.api.url}`
    : `rad web --frontend ${new URL(import.meta.url).origin} --backend ${
        httpd.api.url
      }`;

  let customPort = httpd.api.port;
  const buttonTitle: Record<HttpdState["state"], string> = {
    stopped: "radicle-httpd is stopped",
    running: "radicle-httpd is running",
    authenticated: "radicle-httpd is running - signed in",
  };
</script>

<style>
  .dropdown {
    align-items: center;
    background: var(--color-background-1);
    border-radius: var(--border-radius);
    box-shadow: var(--elevation-low);
    color: var(--color-foreground-6);
    position: absolute;
    right: 5rem;
    top: 5rem;
    width: 15rem;
  }
  .info {
    display: flex;
    padding: 1rem 1rem 0.5rem 1rem;
  }
  .avatar-id-container {
    display: flex;
    flex-direction: column;
    padding: 0.5rem 0.5rem 0.5rem 0.8rem;
    width: 100%;
    gap: 0.5rem;
  }
  .dropdown-button {
    align-items: center;
    border-top: 1px solid var(--color-foreground-3);
    cursor: pointer;
    display: flex;
    flex-direction: row;
    font-weight: 600;
    height: 2.5rem;
    justify-content: space-between;
    line-height: 2.5rem;
    padding: 0 1rem;
    user-select: none;
    width: 100%;
  }
  .dropdown-button:hover {
    background-color: var(--color-foreground-3);
    color: var(--color-foreground-6);
  }
  .rounded:last-of-type:hover {
    border-bottom-left-radius: var(--border-radius);
    border-bottom-right-radius: var(--border-radius);
  }
  .stopped {
    color: var(--color-foreground-5);
  }
  .running {
    color: var(--color-foreground);
  }
  .authenticated {
    color: var(--color-positive);
  }
  .toggle:hover .authenticated {
    color: var(--color-positive);
  }
</style>

<Floating>
  <div slot="toggle" class="toggle">
    <Button
      title={buttonTitle[$httpdStore.state]}
      style="padding-left: 10px; padding-right: 1rem;"
      variant="outline">
      <div style="display: flex; gap: 0.5rem">
        <div
          class:authenticated={$httpdStore.state === "authenticated"}
          class:stopped={$httpdStore.state === "stopped"}
          class:running={$httpdStore.state === "running"}>
          <Icon name="network" />
        </div>
        radicle.local
      </div>
    </Button>
  </div>

  <div slot="modal">
    {#if $httpdStore.state === "authenticated"}
      <div class="dropdown">
        <div class="avatar-id-container">
          <div style="align-items: center; display: flex; gap: 0.25rem;">
            <Authorship authorId={$httpdStore.session.publicKey} />
            <Clipboard text={$httpdStore.session.publicKey} small />
          </div>
        </div>

        <Link
          on:afterNavigate={closeFocused}
          route={{
            resource: "seeds",
            params: {
              hostAndPort: httpd.api.hostAndPort,
              projectPageIndex: 0,
            },
          }}>
          <div class="dropdown-button">Browse</div>
        </Link>

        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
          class="dropdown-button rounded"
          on:click={() => {
            void httpd.disconnect();
            closeFocused();
          }}>
          Disconnect
        </div>
      </div>
    {:else if $httpdStore.state === "running"}
      <div class="dropdown" style:width="20.5rem">
        <div class="info">
          To connect to your local Radicle node, run this command in your
          terminal:
        </div>
        <div style:margin="0 1rem 0.5rem 1rem">
          <Command {command} />
        </div>
        <PortInput bind:port={customPort} />
        <Link
          on:afterNavigate={closeFocused}
          route={{
            resource: "seeds",
            params: {
              hostAndPort: httpd.api.hostAndPort,
              projectPageIndex: 0,
            },
          }}>
          <div class="dropdown-button rounded">Browse</div>
        </Link>
      </div>
    {:else}
      <div class="dropdown" style:width="20.5rem">
        <div class="info">
          To access your local Radicle node on this site, run:
        </div>
        <div style:margin="0.5rem 1rem 1rem 1rem">
          <Command command="radicle-httpd" />
        </div>
        <PortInput bind:port={customPort} />
      </div>
    {/if}
  </div>
</Floating>
