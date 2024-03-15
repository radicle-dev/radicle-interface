<script lang="ts">
  import type {
    BaseUrl,
    NodeStats,
    Policy,
    ProjectListQuery,
    Scope,
  } from "@httpd-client";
  import type { ComponentProps } from "svelte";
  import type { ProjectInfo } from "@app/components/ProjectCard";

  import * as router from "@app/lib/router";
  import { api, httpdStore } from "@app/lib/httpd";
  import { baseUrlToString, isLocal, truncateId } from "@app/lib/utils";
  import { fetchProjectInfos } from "@app/components/ProjectCard";
  import { handleError } from "@app/views/nodes/error";
  import { isDelegate } from "@app/lib/roles";
  import { onMount } from "svelte";

  import AppLayout from "@app/App/AppLayout.svelte";
  import CopyableId from "@app/components/CopyableId.svelte";
  import ErrorMessage from "@app/components/ErrorMessage.svelte";
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

  let localProjects:
    | ProjectInfo[]
    | ComponentProps<ErrorMessage>["error"]
    | undefined;

  onMount(async () => {
    const query: ProjectListQuery = { show: "all" };
    await api
      .getStats()
      .then(({ repos: { total } }) => (query.perPage = total))
      .catch(e => {
        console.error(
          "Not able to query to total repo count for your local node.",
          e,
        );
      });

    localProjects = await fetchProjectInfos(api.baseUrl, query).catch(
      error => error,
    );
  });

  function isSeeding(projectId: string) {
    if (localProjects instanceof Error) {
      console.error("Not able to fetch local projects", localProjects);
      return false;
    }
    return localProjects?.some(p => p.project.id === projectId) ?? false;
  }

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
  .pinned {
    display: flex;
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
  @media (max-width: 720px) {
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
                <div class="global-hide-on-desktop">
                  {truncateId(nid)}
                </div>
                <div class="global-hide-on-mobile">
                  {nid}
                </div>
              </CopyableId>
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

        <div class="global-hide-on-mobile" style:margin-left="auto">
          {#if policy && scope}
            <ScopePolicyPopover
              {scope}
              {policy}
              stylePopoverPositionRight="-1rem" />
          {/if}
        </div>
      </div>
      <div class="subtitle global-hide-on-desktop">
        {#if policy && scope}
          <ScopePolicyPopover
            {scope}
            {policy}
            stylePopoverPositionLeft="-14rem" />
        {/if}
      </div>

      <div style:margin-top="1rem">
        {#await fetchProjectInfos( baseUrl, { show: isLocal(baseUrl.hostname) ? "all" : "pinned" }, )}
          <Loading small center />
        {:then projectInfos}
          <div class="project-grid">
            {#each projectInfos as projectInfo}
              <ProjectCard
                {projectInfo}
                isSeeding={isLocal(baseUrl.hostname)
                  ? true
                  : isSeeding(projectInfo.project.id)}
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
  </div>
</AppLayout>
