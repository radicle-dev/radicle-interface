<script>
  import { experimental } from "@app/lib/appearance";
  import { api, httpdStore } from "@app/lib/httpd";
  import { routeToPath, activeUnloadedRouteStore } from "@app/lib/router";

  import Command from "@app/components/Command.svelte";
  import ExternalLink from "./ExternalLink.svelte";

  $: path = routeToPath($activeUnloadedRouteStore);
  $: pathParam = path === "/" ? "" : `--path "${path}"`;
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
    margin-bottom: 0.75rem;
  }

  .label {
    display: block;
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-regular);
    margin-bottom: 0.75rem;
  }
</style>

<div>
  {#if $experimental}
    {#if $httpdStore.state === "running"}
      <div class="label">
        Authenticate with your local node to make changes.
      </div>
      <Command
        fullWidth
        command={`rad web ${window.origin} --connect ${api.hostname}:${api.port} ${pathParam}`} />
    {:else}
      <div class="heading">Connect & Authenticate</div>
      <div class="label">
        Connect to your local node to browse projects on your local machine,
        create issues, and participate in discussions.
      </div>
      <Command fullWidth command={`rad web ${window.origin} ${pathParam}`} />

      <div class="divider" />
      <div class="heading">New to Radicle?</div>
      <div class="label">
        Visit <ExternalLink href="https://radicle.xyz/#try" /> to download Radicle
        and get started.
      </div>
    {/if}
  {:else}
    <div class="heading">Browse your local projects</div>
    <div class="label">
      To browse projects on your local node, run the following command.
    </div>
    <Command fullWidth command="radicle-httpd" />

    <div class="divider" />
    <div class="heading">New to Radicle?</div>
    <div class="label">
      Visit <ExternalLink href="https://radicle.xyz/#try" /> to download Radicle
      and get started.
    </div>
  {/if}
</div>
