<script lang="ts">
  import type { ProjectLoadedRoute } from "@app/views/projects/router";

  import { formatObjectId, unreachable } from "@app/lib/utils";

  import FilePath from "@app/components/FilePath.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Link from "@app/components/Link.svelte";
  import Separator from "./Separator.svelte";

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
  .id {
    font-size: var(--font-size-small);
    font-family: var(--font-family-monospace);
    font-weight: var(--font-weight-semibold);
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
  {:else if activeRoute.resource === "project.issue" || activeRoute.resource === "project.issues"}
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
  <span class="id">
    <div class="global-hide-on-small-desktop-down">
      {activeRoute.params.commit.commit.id}
    </div>
    <div class="global-hide-on-medium-desktop-up">
      {formatObjectId(activeRoute.params.commit.commit.id)}
    </div>
  </span>
{:else if activeRoute.resource === "project.issue"}
  <Separator />
  <span class="id">
    <div class="global-hide-on-small-desktop-down">
      {activeRoute.params.issue.id}
    </div>
    <div class="global-hide-on-medium-desktop-up">
      {formatObjectId(activeRoute.params.issue.id)}
    </div>
  </span>
{:else if activeRoute.resource === "project.patch"}
  <Separator />
  <span class="id">
    <div class="global-hide-on-small-desktop-down">
      {activeRoute.params.patch.id}
    </div>
    <div class="global-hide-on-medium-desktop-up">
      {formatObjectId(activeRoute.params.patch.id)}
    </div>
  </span>
{/if}
