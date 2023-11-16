<script lang="ts">
  import * as router from "@app/lib/router";
  import * as utils from "@app/lib/utils";

  import NodeSegment from "./Breadcrumbs/NodeSegment.svelte";
  import ProjectSegment from "./Breadcrumbs/ProjectSegment.svelte";
  import Separator from "./Breadcrumbs/Separator.svelte";

  const activeRouteStore = router.activeRouteStore;
</script>

<style>
  .breadcrumbs {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-small);
    white-space: nowrap;
  }
</style>

{#if $activeRouteStore.resource === "booting" || $activeRouteStore.resource === "home" || $activeRouteStore.resource === "session" || $activeRouteStore.resource === "loadError" || $activeRouteStore.resource === "notFound"}
  <!-- Don't render breadcrumbs for these routes. -->
{:else if $activeRouteStore.resource === "nodes"}
  <div class="breadcrumbs">
    <NodeSegment baseUrl={$activeRouteStore.params.baseUrl} />
  </div>
{:else if $activeRouteStore.resource === "project.source" || $activeRouteStore.resource === "project.history" || $activeRouteStore.resource === "project.commit" || $activeRouteStore.resource === "project.issues" || $activeRouteStore.resource === "project.newIssue" || $activeRouteStore.resource === "project.issue" || $activeRouteStore.resource === "project.patches" || $activeRouteStore.resource === "project.patch"}
  <div class="breadcrumbs">
    <NodeSegment baseUrl={$activeRouteStore.params.baseUrl} />

    <Separator />

    <ProjectSegment activeRoute={$activeRouteStore} />
  </div>
{:else}
  {utils.unreachable($activeRouteStore)}
{/if}
