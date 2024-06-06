<script lang="ts">
  import type { BaseUrl } from "@http-client";
  import type { Route } from "@app/lib/router/definitions";

  import { activeUnloadedRouteStore } from "@app/lib/router";
  import { api, httpdStore } from "@app/lib/httpd";
  import { isLocal } from "@app/lib/utils";

  import Button from "@app/components/Button.svelte";
  import Command from "@app/components/Command.svelte";
  import ExternalLink from "@app/components/ExternalLink.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Link from "@app/components/Link.svelte";

  export let baseUrl: BaseUrl;
  export let disableLocalButton: boolean;
  export let hideLocalButton: boolean;
  export let localProject: "notFound" | "found" | undefined;
  export let projectId: string;
  export let popover: boolean = false;

  let route: Route;

  $: {
    route = $activeUnloadedRouteStore;
    if ("node" in route) {
      route.node = api.baseUrl;
    }
  }
</script>

<style>
  .help {
    font-size: var(--font-size-small);
  }
  .popover {
    width: 18.5rem;
  }
  .title {
    padding-bottom: 0.75rem;
    text-wrap: nowrap;
    overflow: hidden;
  }
  .description {
    text-wrap: nowrap;
    overflow: hidden;
  }
</style>

<div class="help" class:popover>
  {#if $httpdStore.state === "stopped"}
    <div class="title txt-bold">Local node not connected</div>
    <div class="description">
      Click the Connect button in the top right
      <br />
      corner to get started.
    </div>
  {:else if localProject === "notFound"}
    <div class="title txt-bold">Project not available locally</div>
    <div class="description" style:padding-bottom="0.5rem">
      This project hasn't been found on your local
      <br />
      node. To get a local copy start seeding it
      <br />
      using the following command.
    </div>
    <Command command={`rad seed ${projectId}`} />
  {:else if $httpdStore.state === "running" && localProject === "found"}
    <div class="title txt-bold">Not authenticated</div>
    <div class="description">To make changes you need to authenticate.</div>
    <div class="description">
      Click the Authenticate button in the top
      <br />
      right corner to get authenticated.
    </div>
  {:else if !isLocal(baseUrl.hostname) && localProject === "found"}
    <div class="title txt-bold">Read Only</div>
    <div class="description">This is a read only preview hosted on</div>
    <ExternalLink href={baseUrl.hostname} />
  {/if}

  {#if !hideLocalButton}
    <div class="txt-overflow" style:padding-top="1rem">
      <Link {route} disabled={disableLocalButton}>
        <Button size="large" styleWidth="100%" disabled={disableLocalButton}>
          <IconSmall name="device" />Make changes on your local node
        </Button>
      </Link>
    </div>
  {/if}
</div>
