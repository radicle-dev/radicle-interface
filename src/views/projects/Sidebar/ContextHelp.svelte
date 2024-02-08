<script lang="ts">
  import type { BaseUrl } from "@httpd-client";
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
  }
</style>

<div class="help" class:popover>
  {#if $httpdStore.state === "stopped"}
    <div class="title txt-bold">Device not connected</div>
    <div>Click the Connect button in the top right corner to get started.</div>
  {:else if localProject === "notFound"}
    <div class="title txt-bold">Project not available locally</div>
    <div style:padding-bottom="0.5rem">
      This project hasn't been found on your local node. To get a local copy
      start seeding it using the following command.
    </div>
    <Command command={`rad seed ${projectId}`} />
  {:else if $httpdStore.state === "running" && localProject === "found"}
    <div class="title txt-bold">Not authenticated</div>
    <div>To make changes you need to authenticate yourself.</div>
    <div>
      Click the Authenticate button in the top right corner to get
      authenticated.
    </div>
  {:else if !isLocal(baseUrl.hostname) && localProject === "found"}
    <div class="title txt-bold">Read Only</div>
    <div>This is a read only preview hosted on</div>
    <ExternalLink href={baseUrl.hostname} />
  {/if}

  {#if !hideLocalButton}
    <div style:padding-top="1rem">
      <Link {route} disabled={disableLocalButton}>
        <Button size="large" styleWidth="100%" disabled={disableLocalButton}>
          <IconSmall name="device" />Make changes on your local node
        </Button>
      </Link>
    </div>
  {/if}
</div>
