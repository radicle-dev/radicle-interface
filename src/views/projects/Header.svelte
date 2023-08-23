<script lang="ts" context="module">
  export type ActiveTab = "source" | "issues" | "patches" | undefined;
</script>

<script lang="ts">
  import type { BaseUrl, Project } from "@httpd-client";

  import { isLocal } from "@app/lib/utils";
  import { pluralize } from "@app/lib/pluralize";

  import CloneButton from "@app/views/projects/Header/CloneButton.svelte";
  import Icon from "@app/components/Icon.svelte";
  import Link from "@app/components/Link.svelte";
  import SquareButton from "@app/components/SquareButton.svelte";

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
    margin-bottom: 1rem;
  }
</style>

<div class="header">
  <Link
    route={{
      resource: "project.source",
      project: project.id,
      node: baseUrl,
      path: "/",
    }}>
    <SquareButton active={activeTab === "source"}>
      <svelte:fragment slot="icon">
        <Icon size="small" name="chevron-left-right" />
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
    <SquareButton active={activeTab === "issues"}>
      <svelte:fragment slot="icon">
        <Icon size="small" name="issue" />
      </svelte:fragment>
      <span class="txt-bold">{project.issues.open}</span>
      {pluralize("issue", project.issues.open)}
    </SquareButton>
  </Link>

  <Link
    route={{
      resource: "project.patches",
      project: project.id,
      node: baseUrl,
    }}>
    <SquareButton active={activeTab === "patches"}>
      <svelte:fragment slot="icon">
        <Icon size="small" name="patch" />
      </svelte:fragment>
      <span class="txt-bold">{project.patches.open}</span>
      {pluralize("patch", project.patches.open)}
    </SquareButton>
  </Link>
  <SquareButton hoverable={false} title="Tracked by {project.trackings} nodes">
    <svelte:fragment slot="icon">
      <Icon size="small" name="network" />
    </svelte:fragment>
    <span class="txt-bold">{project.trackings}</span>
    nodes
  </SquareButton>

  <div
    class="layout-desktop-flex"
    style="margin-left: auto; display: flex; gap: 0.5rem;">
    <Link
      route={{
        resource: "nodes",
        params: {
          baseUrl,
          projectPageIndex: 0,
        },
      }}>
      <SquareButton>
        {isLocal(baseUrl.hostname) ? "radicle.local" : baseUrl.hostname}
      </SquareButton>
    </Link>

    <CloneButton {baseUrl} id={project.id} name={project.name} />
  </div>
</div>
