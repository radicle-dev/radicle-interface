<script lang="ts">
  import Connect from "@app/App/Header/Connect.svelte";
  import Link from "@app/components/Link.svelte";
  import NodeInfo from "@app/App/Header/NodeInfo.svelte";
  import Authenticate from "./Header/Authenticate.svelte";
  import { httpdStore } from "@app/lib/httpd";
  import { nodeStore } from "@app/lib/node";
</script>

<style>
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0;
    padding: 1.5rem;
    height: 5.5rem;
  }
  .left,
  .right {
    display: flex;
    align-items: center;
    height: var(--button-regular-height);
    gap: 1rem;
  }

  .logo {
    height: var(--button-regular-height);
    margin-right: 0.5rem;
  }

  @media (max-width: 720px) {
    header .right {
      gap: 1rem;
    }
  }
</style>

<header>
  <div class="left">
    <Link route={{ resource: "home" }}>
      <img
        width="40"
        height="40"
        class="logo"
        alt="Radicle logo"
        src="/radicle.svg" />
    </Link>
  </div>

  <div class="right layout-desktop-flex">
    {#if $httpdStore.state !== "stopped"}
      {#if $nodeStore}
        <NodeInfo running={$nodeStore === "running"} />
      {/if}
      <Authenticate />
    {/if}
    <Connect />
  </div>
</header>
