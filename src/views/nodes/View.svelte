<script lang="ts">
  import type { BaseUrl, NodeStats, Policy, Scope } from "@http-client";

  import * as router from "@app/lib/router";
  import { api, httpdStore } from "@app/lib/httpd";
  import { baseUrlToString, isLocal, truncateId } from "@app/lib/utils";
  import { fetchProjectInfos } from "@app/components/ProjectCard";
  import { handleError } from "@app/views/nodes/error";
  import { isDelegate } from "@app/lib/roles";

  import Id from "@app/components/Id.svelte";
  import Loading from "@app/components/Loading.svelte";
  import ProjectCard from "@app/components/ProjectCard.svelte";
  import Layout from "./Layout.svelte";
  import IconButton from "@app/components/IconButton.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import capitalize from "lodash/capitalize";
  import ScopePolicyExplainer from "@app/components/ScopePolicyExplainer.svelte";

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
</script>

<style>
  .layout {
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
  .sidebar {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 1.5rem;
    height: 100%;
  }
  @media (max-width: 719.98px) {
    .wrapper {
      width: 100%;
      padding: 1rem;
    }
    .info {
      flex-direction: column;
    }
    .layout {
      padding: 0;
    }
  }
</style>

<Layout stylePaddingBottom="0">
  <svelte:fragment slot="small-header">
    <IconSmall name="seedling" />
    {hostname}
  </svelte:fragment>
  <div slot="header">
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
              <Id ariaLabel="node-id" id={truncateId(nid)} shorten={false} />
            </div>
            <div class="global-hide-on-mobile-down">
              <Id ariaLabel="node-id" id={nid} shorten={false} />
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
  <div slot="sidebar" class="sidebar">
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
              <IconSmall name={`chevron-${expandedNode ? "down" : "right"}`} />
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
  <div class="layout">
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
</Layout>
