<script lang="ts" context="module">
  export type ActiveTab = "source" | "issues" | "patches" | undefined;
</script>

<script lang="ts">
  import type { BaseUrl, Project } from "@httpd-client";

  import { pluralize } from "@app/lib/pluralize";

  import Link from "@app/components/Link.svelte";
  import SquareButton from "@app/components/SquareButton.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";

  export let baseUrl: BaseUrl;
  export let activeTab: ActiveTab = undefined;
  export let project: Project;
</script>

<style>
  .header {
    font-size: var(--font-size-tiny);
    display: flex;
    align-items: center;
    justify-content: left;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .tab-bar {
    border: 1px solid var(--color-fill-secondary);
    display: flex;
    padding: 3px;
    border-radius: var(--border-radius-small);
    gap: 0.25rem;
  }
</style>

<div class="header">
  <div class="tab-bar">
    <Link
      route={{
        resource: "project.source",
        project: project.id,
        node: baseUrl,
        path: "/",
      }}>
      <SquareButton
        variant={activeTab === "source" ? "secondary" : "background"}>
        <svelte:fragment slot="icon">
          <IconSmall name="source" size={16} />
        </svelte:fragment>
        Source
      </SquareButton>
    </Link>
    <Link
      route={{
        resource: "project.issues",
        project: project.id,
        node: baseUrl,
      }}>
      <SquareButton
        variant={activeTab === "issues" ? "secondary" : "background"}>
        <svelte:fragment slot="icon">
          <IconSmall name="issue" size={16} />
        </svelte:fragment>
        <span>{project.issues.open}</span>
        {pluralize("issue", project.issues.open)}
      </SquareButton>
    </Link>

    <Link
      route={{
        resource: "project.patches",
        project: project.id,
        node: baseUrl,
      }}>
      <SquareButton
        variant={activeTab === "patches" ? "secondary" : "background"}>
        <svelte:fragment slot="icon">
          <IconSmall name="patch" size={16} />
        </svelte:fragment>
        <span>{project.patches.open}</span>
        {pluralize("patch", project.patches.open)}
      </SquareButton>
    </Link>

    <div class="layout-desktop">
      <SquareButton
        variant="background"
        hoverable={false}
        title="Tracked by {project.trackings} nodes">
        <svelte:fragment slot="icon">
          <IconSmall name="node" size={16} />
        </svelte:fragment>
        <span>{project.trackings}</span>
        nodes
      </SquareButton>
    </div>
  </div>
</div>
