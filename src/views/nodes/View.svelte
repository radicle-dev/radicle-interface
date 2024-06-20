<script lang="ts">
  import type { BaseUrl, NodeStats, Policy, Scope } from "@http-client";

  import { fade } from "svelte/transition";

  import * as router from "@app/lib/router";
  import { api, httpdStore } from "@app/lib/httpd";
  import { baseUrlToString, isLocal, truncateId } from "@app/lib/utils";
  import { fetchProjectInfos } from "@app/components/ProjectCard";
  import { handleError } from "@app/views/nodes/error";
  import { isDelegate } from "@app/lib/roles";

  import Id from "@app/components/Id.svelte";
  import Link from "@app/components/Link.svelte";
  import Loading from "@app/components/Loading.svelte";
  import MobileFooter from "@app/App/MobileFooter.svelte";
  import ProjectCard from "@app/components/ProjectCard.svelte";
  import Button from "@app/components/Button.svelte";
  import Popover from "@app/components/Popover.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import NodeInfo from "./NodeInfo.svelte";

  export let baseUrl: BaseUrl;
  export let nid: string;
  export let stats: NodeStats;
  export let externalAddresses: string[];
  export let version: string;
  export let policy: Policy | undefined = undefined;
  export let scope: Scope | undefined = undefined;

  $: hostname = isLocal(baseUrl.hostname) ? "Local Node" : baseUrl.hostname;
  $: session =
    $httpdStore.state === "authenticated" && isLocal(api.baseUrl.hostname)
      ? $httpdStore.session
      : undefined;

  let scrollY: number;

  let smallHeader = false;

  let top: number;

  $: if (scrollY >= 0 && scrollY < 230) {
    top = 288 - scrollY;
  }

  $: if (scrollY > 143) {
    smallHeader = true;
  } else {
    smallHeader = false;
  }
</script>

<style>
  .layout {
    height: 100%;
  }

  .bottom-part {
    display: grid;
    grid-template: auto 1fr auto / auto 1fr auto;
  }
  .breadcrumbs {
    display: flex;
    gap: 0.5rem;
    flex-direction: row;
    align-items: center;
    height: 3.5rem;
    margin-left: 1.5rem;
  }

  .outer-header {
    grid-column: 1 / 4;
    border-bottom: 1px solid var(--color-fill-separator);
    background: linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55)),
      url("/images/aliens.png");
    background-position: center;
    background-size: cover;
    height: 18rem;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    position: sticky;
    top: -14.5rem;
    z-index: 10;
  }
  .inner-header {
    height: 3.5rem;
    position: sticky;
    top: 0;
  }

  .sidebar {
    grid-column: 1 / 2;
    border-right: 1px solid var(--color-fill-separator);
    width: 20.5rem;
    position: fixed;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 1.5rem;
    height: 100%;
  }

  .content {
    grid-column: 2 / 3;
    margin-left: 20.5rem;
  }

  .mobile-footer {
    display: none;
  }

  .container {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  .wrapper {
    padding: 3rem;
    max-width: 78rem;
    margin: 0 auto;
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .subtitle {
    font-size: var(--font-size-small);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
  }
  .info {
    display: flex;
    justify-content: space-between;
  }

  .project-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(21rem, 1fr));
    gap: 1rem;
  }
  .empty-state {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    height: 35vh;
  }
  .empty-state .heading {
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-bold);
  }
  .empty-state .label {
    display: block;
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-regular);
  }
  @media (max-width: 719.98px) {
    .bottom-part {
      height: 100%;
    }
    .outer-header {
      display: none;
    }
    .content {
      overflow-x: hidden;
      margin-left: 0;
    }
    .mobile-footer {
      margin-top: auto;
      display: grid;
      grid-column: 1 / 4;
      background-color: pink;
    }
    .wrapper {
      width: 100%;
      padding: 1rem;
    }
    .info {
      flex-direction: column;
    }
    .container {
      padding: 0;
    }
  }

  @media (max-width: 1010.98px) {
    .wrapper {
      padding: 3rem 1.5rem;
    }
  }
</style>

<svelte:window bind:scrollY />

<div class="layout">
  <div class="outer-header">
    <div class="inner-header">
      <div class="breadcrumbs">
        <Link
          style="display: flex; align-items: center;"
          route={{ resource: "home" }}>
          <img
            width="24"
            height="24"
            class="logo"
            alt="Radicle logo"
            src="/radicle.svg" />
        </Link>
        {#if smallHeader}
          <div
            in:fade={{ duration: 100 }}
            style="display: flex; flex-direction: row; align-items:center; gap: 0.5rem; color: var(--color-foreground-white)">
            <IconSmall name="seedling" />
            {hostname}
          </div>
        {/if}
      </div>
    </div>
    {#if !smallHeader}
      <div in:fade={{ duration: 100 }}>
        <div style:padding="1.5rem">
          <div
            class="txt-huge txt-semibold"
            style:color="var(--color-foreground-white)">
            {hostname}
          </div>
          <div class="info">
            <div>
              {#each externalAddresses as address}
                <!-- If there are externalAddresses this is probably a remote node -->
                <!-- in that case, we show all the defined externalAddresses as a listing -->
                <Id
                  ariaLabel="node-id"
                  shorten={false}
                  id="{truncateId(nid)}@{address}"
                  clipboard={`${nid}@${address}`} />
              {:else}
                <!-- else this is probably a local node -->
                <!-- So we show only the nid -->
                <div class="global-hide-on-small-desktop-up">
                  <Id
                    ariaLabel="node-id"
                    id={truncateId(nid)}
                    shorten={false} />
                </div>
                <div class="global-hide-on-mobile-down">
                  <Id ariaLabel="node-id" id={nid} shorten={false} />
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>

  <div class="bottom-part">
    <div
      class="sidebar global-hide-on-mobile-down"
      style:top={`${top}px`}
      style:height={`calc(100% - ${top}px)`}>
      <div>
        <div class="title txt-medium txt-semibold">🌱 Garden</div>
        <div class="description txt-small">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam vel
          libero mauris. In ultricies nulla ut nibh elementum fermentum.
          Suspendisse nec arcu placerat.
        </div>
      </div>
      <div class="sidebar-footer">
        <NodeInfo {scope} {policy} {version} />
      </div>
    </div>

    <div class="content">
      <div class="container">
        <div class="wrapper">
          <div class="subtitle">
            <div class="txt-semibold">
              {isLocal(baseUrl.hostname) ? "Seeded" : "Pinned"} repositories
            </div>
          </div>

          <div style:margin-top="1rem">
            {#await fetchProjectInfos( baseUrl, { show: isLocal(baseUrl.hostname) ? "all" : "pinned", perPage: stats.repos.total }, )}
              <div style:height="35vh">
                <Loading small center />
              </div>
            {:then projectInfos}
              {#if projectInfos.length > 0}
                <div class="project-grid">
                  {#each projectInfos as projectInfo}
                    <ProjectCard
                      {projectInfo}
                      isDelegate={isDelegate(
                        session?.publicKey,
                        projectInfo.project.delegates.map(d => d.id),
                      ) ?? false} />
                  {/each}
                </div>
              {:else}
                <div class="empty-state">
                  <div class="heading">No pinned repositories</div>
                  <div class="label">
                    This node doesn't have any pinned repositories.
                  </div>
                </div>
              {/if}
            {:catch error}
              {router.push(handleError(error, baseUrlToString(api.baseUrl)))}
            {/await}
          </div>
        </div>
      </div>
    </div>

    <div class="mobile-footer">
      <MobileFooter>
        <div style:width="100%">
          <Popover popoverPositionBottom="3rem" popoverPositionRight="-4.5rem">
            <Button
              let:expanded
              slot="toggle"
              variant={expanded ? "secondary" : "secondary-mobile-toggle"}
              styleWidth="100%"
              let:toggle
              on:click={toggle}>
              <IconSmall name="seedling" />
            </Button>

            <div slot="popover">
              <NodeInfo {scope} {policy} {version} />
            </div>
          </Popover>
        </div>
      </MobileFooter>
    </div>
  </div>
</div>
