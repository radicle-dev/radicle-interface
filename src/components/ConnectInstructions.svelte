<script>
  import { api, httpdStore } from "@app/lib/httpd";
  import Command from "./Command.svelte";
</script>

<style>
  .divider {
    height: 1px;
    width: 100%;
    background-color: var(--color-fill-separator);
    margin: 1rem 0;
  }

  .heading {
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-bold);
    margin-bottom: 0.5rem;
  }

  .label {
    display: block;
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-regular);
    margin-bottom: 0.75rem;
    margin-top: 0.75rem;
  }
</style>

<div>
  {#if $httpdStore.state === "running"}
    <div class="label">Authenticate with your local node to make changes.</div>
    <Command
      fullWidth
      command={`rad web ${window.origin} --connect ${api.hostname}:${api.port}`} />
  {:else}
    <div class="heading">Connect & Authenticate</div>
    <div class="label">
      Connect to your local node to browse projects on your local machine,
      create issues, and participate in discussions.
    </div>
    <Command fullWidth command={`rad web ${window.origin}`} />

    <div class="divider" />
    <div class="heading">New to Radicle?</div>
    <div class="label">
      Run the following command and follow the instructions to install Radicle
      and get started.
    </div>
    <Command fullWidth command="sh <(curl -sSf https://radicle.xyz/install)" />
  {/if}
</div>
