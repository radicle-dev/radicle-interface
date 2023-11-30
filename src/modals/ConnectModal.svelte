<script lang="ts">
  import * as httpd from "@app/lib/httpd";
  import * as modal from "@app/lib/modal";
  import { httpdStore } from "@app/lib/httpd";

  import Command from "@app/components/Command.svelte";
  import Modal from "@app/components/Modal.svelte";
  import Icon from "@app/components/Icon.svelte";
  import IconButton from "@app/components/IconButton.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Link from "@app/components/Link.svelte";
  import TextInput from "@app/components/TextInput.svelte";

  $: customUrl = `${httpd.api.baseUrl.scheme}://${httpd.api.baseUrl.hostname}:${customPort}`;
  $: command = `rad web --frontend ${
    new URL(import.meta.url).origin
  } --backend ${customUrl}`;
  let customPort = httpd.api.port;
  $: validPortNumber = Number(customPort) > 0 && Number(customPort) <= 65535;

  $: if ($httpdStore.state === "authenticated") {
    modal.hide();
  }
</script>

<style>
  .container {
    display: flex;
    flex-direction: column;
    width: 33rem;
    margin-top: 1.5rem;
    gap: 1.5rem;
  }
  .progress {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .progress-bar {
    height: 6px;
    border-radius: var(--border-radius-round);
    background-color: var(--color-background-dip);
  }
  .bar {
    display: flex;
    background-color: var(--color-fill-secondary);
    height: 100%;
    border-radius: var(--border-radius-round);
  }
  .captions {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    color: var(--color-foreground-dim);
    font-size: var(--font-size-tiny);
    text-align: center;
  }

  .input {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .status {
    font-size: var(--font-size-tiny);
    color: var(--color-fill-gray);
  }
  .separator {
    height: 1px;
    background-color: var(--color-border-hint);
  }

  .host {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: var(--font-size-small);
  }

  .label {
    font-size: var(--font-size-small);
  }
</style>

<Modal title="Connect and authenticate">
  <Icon name="key" size="48" slot="icon" />

  <svelte:fragment slot="subtitle">
    Complete the steps below to browse projects on your local machine,
    <br />
    create issues, and participate in discussions.
  </svelte:fragment>

  <div class="container" slot="body">
    {#if $httpdStore.state === "stopped"}
      <div class="progress">
        <div class="progress-bar">
          <div class="bar" style:width="1%" />
        </div>
        <div class="captions">
          <div
            style:text-align="left"
            style:color="var(--color-fill-secondary)">
            Start httpd server
          </div>
          <div>Authenticate</div>
          <div style:text-align="right">Done</div>
        </div>
      </div>

      <div class="input">
        <div class="label">
          Run this command in your terminal to connect to your local node:
        </div>
        <Command fullWidth command="radicle-httpd" />
      </div>

      <div class="input">
        <div class="label">Port:</div>
        <div style="width: 100%;">
          <TextInput
            name="port"
            size="small"
            bind:value={customPort}
            valid={validPortNumber}
            validationMessage="Invalid port"
            on:submit={() => httpd.changeHttpdPort(Number(customPort))}>
            <div
              slot="right"
              style="height: 100%; display: flex; align-items: center; padding: 0 0.5rem 0 0.25rem;">
              <IconSmall name="edit" />
            </div>
          </TextInput>
        </div>
      </div>
    {:else if $httpdStore.state === "running"}
      <div class="progress">
        <div class="progress-bar">
          <div class="bar" style:width="50%" />
        </div>
        <div class="captions">
          <div style:text-align="left">Start httpd server</div>
          <div style:color="var(--color-fill-secondary)">Authenticate</div>
          <div style:text-align="right">Done</div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <div class="status">Httpd server running</div>
        <div class="host">
          radicle.local
          <Link
            on:afterNavigate={modal.hide}
            route={{
              resource: "nodes",
              params: {
                baseUrl: httpd.api.baseUrl,
                projectPageIndex: 0,
              },
            }}>
            <IconButton>Browse</IconButton>
          </Link>
        </div>
      </div>
      <div class="separator" />
      <div class="input">
        <div class="label">
          Run this command in your terminal to authenticate yourself:
        </div>
        <Command fullWidth {command} />
      </div>
      <div class="input">
        <div class="label">Port:</div>
        <div style="width: 100%;">
          <TextInput
            name="port"
            size="small"
            bind:value={customPort}
            valid={validPortNumber}
            validationMessage="Invalid port"
            on:submit={() => httpd.changeHttpdPort(Number(customPort))}>
            <div
              slot="right"
              style="height: 100%; display: flex; align-items: center; padding: 0 0.5rem 0 0.25rem;">
              <IconSmall name="edit" />
            </div>
          </TextInput>
        </div>
      </div>
    {/if}
  </div>
</Modal>
