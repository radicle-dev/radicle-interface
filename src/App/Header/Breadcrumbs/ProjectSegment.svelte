<script lang="ts">
  import type { ProjectLoadedRoute } from "@app/views/projects/router";

  import * as utils from "@app/lib/utils";
  import { unreachable } from "@app/lib/utils";

  import CopyableId from "@app/components/CopyableId.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Link from "@app/components/Link.svelte";
  import Separator from "./Separator.svelte";
  import FilePath from "@app/components/FilePath.svelte";

  export let activeRoute: ProjectLoadedRoute;
</script>

<style>
  .segment {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  .segment :global(a:hover) {
    color: var(--color-fill-secondary);
  }
</style>

<span class="segment">
  <Link
    route={{
      resource: "project.source",
      project: activeRoute.params.project.id,
      node: activeRoute.params.baseUrl,
    }}>
    <div class="segment">
      {#if activeRoute.params.project.visibility?.type === "private"}
        <IconSmall name="lock" />
      {/if}
      {activeRoute.params.project.name}
    </div>
  </Link>
</span>

<span class="segment">
  {#if activeRoute.resource === "project.history"}
    <Separator />
    <Link
      route={{
        resource: "project.history",
        project: activeRoute.params.project.id,
        node: activeRoute.params.baseUrl,
      }}>
      Commits
    </Link>
  {:else if activeRoute.resource === "project.commit"}
    <Separator />
    <Link
      route={{
        resource: "project.history",
        project: activeRoute.params.project.id,
        node: activeRoute.params.baseUrl,
      }}>
      Commits
    </Link>
  {:else if activeRoute.resource === "project.newIssue" || activeRoute.resource === "project.issue" || activeRoute.resource === "project.issues"}
    <Separator />
    <Link
      route={{
        resource: "project.issues",
        project: activeRoute.params.project.id,
        node: activeRoute.params.baseUrl,
      }}>
      Issues
    </Link>
  {:else if activeRoute.resource === "project.patch" || activeRoute.resource === "project.patches"}
    <Separator />
    <Link
      route={{
        resource: "project.patches",
        project: activeRoute.params.project.id,
        node: activeRoute.params.baseUrl,
      }}>
      Patches
    </Link>
  {:else if activeRoute.resource === "project.source"}
    {#if activeRoute.params.path !== "/"}
      <Separator />
      <FilePath filenameWithPath={activeRoute.params.path} />
    {/if}
  {:else}
    {unreachable(activeRoute)}
  {/if}
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
