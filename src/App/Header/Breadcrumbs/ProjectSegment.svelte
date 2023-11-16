<script lang="ts">
  import type { ProjectLoadedRoute } from "@app/views/projects/router";

  import { capitalize } from "lodash";
  import * as utils from "@app/lib/utils";

  import CopyableId from "@app/components/CopyableId.svelte";
  import Link from "@app/components/Link.svelte";
  import Separator from "./Separator.svelte";

  export let activeRoute: ProjectLoadedRoute;
</script>

<style>
  .segment :global(a:hover) {
    color: var(--color-fill-primary);
  }
</style>

<span class="segment">
  <Link
    route={{
      resource: "project.source",
      project: activeRoute.params.project.id,
      node: activeRoute.params.baseUrl,
    }}>
    {activeRoute.params.project.name}
  </Link>
</span>

<Separator />

<span class="segment">
  <Link
    route={{
      resource: "project.source",
      project: activeRoute.params.project.id,
      node: activeRoute.params.baseUrl,
    }}>
    {#if activeRoute.resource === "project.history" || activeRoute.resource === "project.commit"}
      Commits
    {:else if activeRoute.resource === "project.newIssue" || activeRoute.resource === "project.issue"}
      Issues
    {:else if activeRoute.resource === "project.patch"}
      Patches
    {:else}
      {capitalize(activeRoute.resource.split(".")[1])}
    {/if}
  </Link>
</span>

{#if activeRoute.resource === "project.commit"}
  <Separator />
  <CopyableId id={activeRoute.params.commit.commit.id}>
    {utils.formatCommit(activeRoute.params.commit.commit.id)}
  </CopyableId>
{:else if activeRoute.resource === "project.issue"}
  <Separator />
  <CopyableId id={activeRoute.params.issue.id}>
    {utils.formatObjectId(activeRoute.params.issue.id)}
  </CopyableId>
{:else if activeRoute.resource === "project.patch"}
  <Separator />
  <CopyableId id={activeRoute.params.patch.id}>
    {utils.formatObjectId(activeRoute.params.patch.id)}
  </CopyableId>
{/if}
