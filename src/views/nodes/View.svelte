<script lang="ts">
  import type { BaseUrl, NodeStats, Policy, Scope } from "@httpd-client";

  import * as router from "@app/lib/router";
  import { api, httpdStore } from "@app/lib/httpd";
  import { baseUrlToString, isLocal, truncateId } from "@app/lib/utils";
  import { fetchProjectInfos } from "@app/components/ProjectCard";
  import { handleError } from "@app/views/nodes/error";
  import { isDelegate } from "@app/lib/roles";

  import AppLayout from "@app/App/AppLayout.svelte";
  import CopyableId from "@app/components/CopyableId.svelte";
  import Loading from "@app/components/Loading.svelte";
  import ProjectCard from "@app/components/ProjectCard.svelte";
  import ScopePolicyPopover from "@app/views/nodes/ScopePolicyPopover.svelte";

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
</script>

<style>
  .layout {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    padding: 3rem 0 5rem 0;
  }
  .header {
    display: flex;
    gap: 0.5rem;
    flex-direction: column;
    margin-bottom: 2rem;
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

<AppLayout>
  <div class="layout">
    <div class="wrapper">
      <div class="header">
        <div class="txt-large txt-bold">{hostname}</div>
        <div class="info">
          <div>
            {#each externalAddresses as address}
              <!-- If there are externalAddresses this is probably a remote node -->
              <!-- in that case, we show all the defined externalAddresses as a listing -->
              <CopyableId id={`${nid}@${address}`} style="oid">
                {truncateId(nid)}@{address}
              </CopyableId>
            {:else}
              <!-- else this is probably a local node -->
              <!-- So we show only the nid -->
              <CopyableId id={nid} style="oid">
                <div class="global-hide-on-small-desktop-up">
                  {truncateId(nid)}
                </div>
                <div class="global-hide-on-mobile-down">
                  {nid}
                </div>
              </CopyableId>
            {/each}
          </div>
          <div class="version">
            {version}
          </div>
        </div>
      </div>

      <div class="subtitle">
        <div class="txt-semibold">
          {isLocal(baseUrl.hostname) ? "Seeded" : "Pinned"} projects
        </div>
        <div class="global-hide-on-mobile-down" style:margin-left="auto">
          {#if policy && scope}
            <ScopePolicyPopover {scope} {policy} popoverPositionRight="0" />
          {/if}
        </div>
      </div>
      <div class="subtitle global-hide-on-small-desktop-up">
        {#if policy && scope}
          <ScopePolicyPopover {scope} {policy} popoverPositionRight="-4.5rem" />
        {/if}
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
              <div class="heading">No pinned projects</div>
              <div class="label">
                This node doesn't have any pinned projects.
              </div>
            </div>
          {/if}
        {:catch error}
          {router.push(handleError(error, baseUrlToString(api.baseUrl)))}
        {/await}
      </div>
    </div>
  </div>
</AppLayout>
