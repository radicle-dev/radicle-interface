<script lang="ts">
  import type { BaseUrl, NodeStats, Policy, Scope } from "@httpd-client";

  import capitalize from "lodash/capitalize";

  import * as router from "@app/lib/router";
  import { api, httpdStore } from "@app/lib/httpd";
  import { baseUrlToString, isLocal, truncateId } from "@app/lib/utils";
  import { fetchProjectInfos } from "@app/components/ProjectCard";
  import { handleError } from "@app/views/nodes/error";
  import { isDelegate } from "@app/lib/roles";

  import AppLayout from "@app/App/AppLayout.svelte";
  import CopyableId from "@app/components/CopyableId.svelte";
  import HoverPopover from "@app/components/HoverPopover.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import ProjectCard from "@app/components/ProjectCard.svelte";
  import ScopePolicyExplainer from "@app/components/ScopePolicyExplainer.svelte";
  import Loading from "@app/components/Loading.svelte";

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

  .separator {
    width: 1px;
    background-color: var(--color-fill-separator);
    display: flex;
    height: 1rem;
  }
  .subtitle {
    font-size: var(--font-size-small);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    width: 100%;
    white-space: nowrap;
    flex-wrap: wrap;
  }
  .pinned {
    display: flex;
    align-items: center;
  }
  .right {
    margin-left: auto;
    display: flex;
    gap: 0.5rem;
    align-items: center;
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
  .popover {
    width: 18rem;
    color: var(--color-foreground-contrast);
  }
  @media (max-width: 720px) {
    .layout {
      width: 100%;
      display: flex;
      justify-content: center;
      padding: 0;
    }
    .info {
      flex-direction: column;
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
              <CopyableId id={nid} style="oid" />
            {/each}
          </div>
          <div class="version">
            v{version}
          </div>
        </div>
      </div>

      <div class="subtitle">
        <div class="pinned txt-semibold">
          {stats.repos.total} repositories hosted
        </div>

        {#if policy && scope}
          <div class="right">
            <span>
              Seeding Policy: <span class="txt-semibold">
                {capitalize(policy)}
              </span>
            </span>
            <span class="separator" />
            <span>
              Scope:
              <span class="txt-semibold">{capitalize(scope)}</span>
            </span>
            <span style:color="var(--color-fill-gray)">
              <HoverPopover
                stylePopoverPositionRight="-1rem"
                stylePopoverPositionBottom="1.5rem">
                <div slot="toggle">
                  <span style:color="var(--color-fill-gray)">
                    <IconSmall name="info" />
                  </span>
                </div>

                <div slot="popover" class="popover">
                  <ScopePolicyExplainer {scope} {policy} />
                </div>
              </HoverPopover>
            </span>
          </div>
        {/if}
      </div>

      {#await fetchProjectInfos(baseUrl, isLocal(baseUrl.hostname) ? "all" : "pinned")}
        <Loading small center />
      {:then projectInfos}
        <div class="project-grid">
          {#each projectInfos as projectInfo}
            <ProjectCard
              {projectInfo}
              isSeeding={false}
              isDelegate={isDelegate(
                session?.publicKey,
                projectInfo.project.delegates,
              ) ?? false} />
          {/each}
        </div>
      {:catch error}
        {router.push(handleError(error, baseUrlToString(api.baseUrl)))}
      {/await}
    </div>
  </div>
</AppLayout>
