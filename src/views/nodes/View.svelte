<script lang="ts">
  import type { BaseUrl, NodeStats, Policy, Scope } from "@http-client";

  import { fade } from "svelte/transition";

  import * as router from "@app/lib/router";
  import { api, httpdStore } from "@app/lib/httpd";
  import { baseUrlToString, isLocal, truncateId } from "@app/lib/utils";
  import { fetchProjectInfos } from "@app/components/ProjectCard";
  import { handleError } from "@app/views/nodes/error";
  import { isDelegate } from "@app/lib/roles";

  import IconButton from "@app/components/IconButton.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Id from "@app/components/Id.svelte";
  import Link from "@app/components/Link.svelte";
  import Loading from "@app/components/Loading.svelte";
  import MobileFooter from "@app/App/MobileFooter.svelte";
  import ProjectCard from "@app/components/ProjectCard.svelte";
  import ScopePolicyExplainer from "@app/components/ScopePolicyExplainer.svelte";
  import capitalize from "lodash/capitalize";

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
  let expandedNode = false;

  $: shortSeedingPolicy =
    scope === "all" && policy === "allow" ? "permissive" : "restrictive";

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
    height: 100%;
  }
  .breadcrumbs {
    display: flex;
    gap: 0.5rem;
    flex-direction: row;
    align-items: center;
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

  .mobile-footer {
    display: none;
  }

  .content {
    grid-column: 2 / 3;
    margin-left: 20.5rem;
  }

  .container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    padding: 3rem 0 5rem 0;
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
  .version {
    color: var(--color-fill-gray);
    font-family: var(--font-family-monospace);
    font-size: var(--font-size-small);
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
  .policies {
    font-size: var(--font-size-small);
    display: flex;
    flex-direction: column;
  }
  .item {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }
  @media (max-width: 719.98px) {
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
</style>

<svelte:window bind:scrollY />

<div class="layout">
  <div class="outer-header">
    <div class="inner-header">
      <div class="breadcrumbs" style:padding="1rem 1.5rem" style:display="flex">
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
          <IconSmall name="seedling" />
          {hostname}
        {/if}
      </div>
    </div>
    {#if !smallHeader}
      <div in:fade={{ duration: 200 }}>
        <div style:padding="1.5rem">
          <div class="txt-huge txt-semibold">{hostname}</div>
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
        <div class="policies">
          <div class="item">
            <div class="item" style="justify-content: flex-start;">
              <span class="no-wrap">Seeding Policy</span>
            </div>
            <div
              style="display: flex; flex-direction: row; gap: 0.5rem; align-items: center;">
              <div class="txt-bold">
                {capitalize(shortSeedingPolicy)}
              </div>
              <IconButton on:click={() => (expandedNode = !expandedNode)}>
                <IconSmall
                  name={`chevron-${expandedNode ? "down" : "right"}`} />
              </IconButton>
            </div>
          </div>
          {#if expandedNode && scope && policy}
            <div style:padding="0 0 1rem 1rem">
              <ScopePolicyExplainer {scope} {policy} />
            </div>
          {/if}
        </div>
        <div
          class="item"
          style="justify-content: space-between; display: flex; text-wrap: nowrap; font-size: var(--font-size-small); ">
          <span>Radicle version</span>
          <Id id={version} ariaLabel="node-id" shorten={false}>
            <div class="version" style="width: 10rem;">
              <div class="txt-overflow">{version}</div>
            </div>
          </Id>
        </div>
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

          <div style:margin-top="1rem" style:padding-bottom="2.5rem">
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
      <MobileFooter />
    </div>
  </div>
</div>
