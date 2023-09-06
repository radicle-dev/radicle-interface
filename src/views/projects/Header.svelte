<script lang="ts" context="module">
  export type ActiveTab = "source" | "issues" | "patches" | undefined;
</script>

<script lang="ts">
  import type { BaseUrl, Project } from "@httpd-client";

  import { pluralize } from "@app/lib/pluralize";

  import Link from "@app/components/Link.svelte";
  import Button from "@app/components/Button.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Radio from "@app/components/Radio.svelte";

  export let baseUrl: BaseUrl;
  export let activeTab: ActiveTab = undefined;
  export let project: Project;
</script>

<style>
  .header {
    display: flex;
    align-items: center;
    justify-content: left;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
</style>

<div class="header">
  <Radio outline>
    <Link
      route={{
        resource: "project.source",
        project: project.id,
        node: baseUrl,
        path: "/",
      }}>
      <Button variant={activeTab === "source" ? "secondary" : "background"}>
        <IconSmall name="chevron-left-right" />
        Source
      </Button>
    </Link>
    <Link
      route={{
        resource: "project.issues",
        project: project.id,
        node: baseUrl,
      }}>
      <Button variant={activeTab === "issues" ? "secondary" : "background"}>
        <IconSmall name="issue" />
        <div>
          {project.issues.open}
          {pluralize("issue", project.issues.open)}
        </div>
      </Button>
    </Link>

    <Link
      route={{
        resource: "project.patches",
        project: project.id,
        node: baseUrl,
      }}>
      <Button variant={activeTab === "patches" ? "secondary" : "background"}>
        <IconSmall name="patch" />
        <div>
          {project.patches.open}
          {pluralize("patch", project.patches.open)}
          <div></div>
        </div>
      </Button>
    </Link>

    <div class="layout-desktop">
      <Button
        disabled
        variant="background"
        title="Tracked by {project.trackings} nodes">
        <IconSmall name="network" />
        <div>
          {project.trackings} nodes
        </div>
      </Button>
    </div>
  </Radio>
</div>
