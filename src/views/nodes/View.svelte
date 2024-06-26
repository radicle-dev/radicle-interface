<script lang="ts">
  import type { BaseUrl, DefaultSeedingPolicy, NodeStats } from "@http-client";

  import { capitalize } from "lodash";

  import * as router from "@app/lib/router";
  import { api, httpdStore } from "@app/lib/httpd";
  import {
    baseUrlToString,
    formatUserAgent,
    isLocal,
    truncateId,
  } from "@app/lib/utils";
  import { fetchProjectInfos } from "@app/components/ProjectCard";
  import { handleError } from "@app/views/nodes/error";
  import { isDelegate } from "@app/lib/roles";

  import AppLayout from "@app/App/AppLayout.svelte";
  import IconButton from "@app/components/IconButton.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Id from "@app/components/Id.svelte";
  import Loading from "@app/components/Loading.svelte";
  import Popover from "@app/components/Popover.svelte";
  import ProjectCard from "@app/components/ProjectCard.svelte";
  import ScopePolicyExplainer from "@app/components/ScopePolicyExplainer.svelte";

  export let baseUrl: BaseUrl;
  export let nid: string;
  export let stats: NodeStats;
  export let externalAddresses: string[];
  export let seedingPolicy: DefaultSeedingPolicy | undefined = undefined;
  export let agent: string;

  $: shortScope =
    seedingPolicy?.default === "allow" && seedingPolicy?.scope === "all"
      ? "permissive"
      : "restrictive";
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
  .agent {
    color: var(--color-fill-gray);
    font-family: var(--font-family-monospace);
    font-size: var(--font-size-small);
  }
  .seeding-policy {
    display: flex;
    align-items: center;
    gap: 0.5rem;
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
          <Id
            ariaLabel="agent"
            id={formatUserAgent(agent)}
            shorten={false}
            style="none">
            <div class="agent">
              {formatUserAgent(agent)}
            </div>
          </Id>
        </div>
      </div>

      <div class="subtitle" style:justify-content="space-between">
        <div class="txt-semibold">
          {isLocal(baseUrl.hostname) ? "Seeded" : "Pinned"} repositories
        </div>
        <div class="seeding-policy">
          {#if seedingPolicy}
            <span class="txt-bold">Seeding Policy:</span>
            {capitalize(shortScope)}
            <div class="global-hide-on-mobile-down">
              <Popover
                popoverPositionBottom="0"
                popoverPositionLeft="-17rem"
                popoverPositionRight="2rem">
                <IconButton slot="toggle" let:toggle on:click={toggle}>
                  <IconSmall name="help" />
                </IconButton>
                <ScopePolicyExplainer slot="popover" {seedingPolicy} />
              </Popover>
            </div>
          {/if}
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
</AppLayout>
