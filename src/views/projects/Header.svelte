<script lang="ts" context="module">
  export type ActiveTab = "source" | "issues" | "patches" | undefined;
</script>

<script lang="ts">
  import type { BaseUrl, Project } from "@http-client";

  import Link from "@app/components/Link.svelte";
  import Button from "@app/components/Button.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";

  export let baseUrl: BaseUrl;
  export let activeTab: ActiveTab = undefined;
  export let project: Project;
</script>

<style>
  .container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .counter {
    border-radius: var(--border-radius-tiny);
    background-color: var(--color-fill-ghost);
    color: var(--color-foreground-dim);
    padding: 0 0.25rem;
  }

  .selected {
    background-color: var(--color-fill-counter);
    color: var(--color-foreground-contrast);
  }

  .hover {
    background-color: var(--color-fill-ghost-hover);
    color: var(--color-foreground-contrast);
  }

  .title-counter {
    display: flex;
    gap: 0.5rem;
    justify-content: space-between;
    width: 100%;
  }
</style>

<div class="container">
  <Link
    route={{
      resource: "project.source",
      project: project.id,
      node: baseUrl,
      path: "/",
    }}>
    <Button
      size="large"
      styleWidth="100%"
      styleJustifyContent="flex-start"
      variant={activeTab === "source" ? "gray" : "background"}>
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
    <Button
      let:hover
      size="large"
      styleJustifyContent="flex-start"
      styleWidth="100%"
      variant={activeTab === "issues" ? "gray" : "background"}>
      <IconSmall name="issue" />
      <div class="title-counter">
        Issues
        <span
          class="counter"
          class:selected={activeTab === "issues"}
          class:hover={hover && activeTab !== "issues"}>
          {project.issues.open}
        </span>
      </div>
    </Button>
  </Link>

  <Link
    route={{
      resource: "project.patches",
      project: project.id,
      node: baseUrl,
    }}>
    <Button
      let:hover
      size="large"
      styleWidth="100%"
      styleJustifyContent="flex-start"
      variant={activeTab === "patches" ? "gray" : "background"}>
      <IconSmall name="patch" />
      <div class="title-counter">
        Patches
        <span
          class="counter"
          class:hover={hover && activeTab !== "patches"}
          class:selected={activeTab === "patches"}>
          {project.patches.open}
        </span>
      </div>
    </Button>
  </Link>
</div>
