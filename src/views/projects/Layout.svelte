<script lang="ts">
  import type { ActiveTab } from "./Header.svelte";
  import type { BaseUrl, Node, Project } from "@http-client";

  import AppHeader from "@app/App/Header.svelte";

  import Button from "@app/components/Button.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Link from "@app/components/Link.svelte";
  import MobileFooter from "@app/App/MobileFooter.svelte";
  import Sidebar from "@app/views/projects/Sidebar.svelte";

  export let activeTab: ActiveTab | undefined = undefined;
  export let node: Node;
  export let baseUrl: BaseUrl;
  export let project: Project;
  export let stylePaddingBottom: string = "2.5rem";
</script>

<style>
  .layout {
    display: grid;
    grid-template: auto 1fr auto / auto 1fr auto;
    height: 100%;
  }

  .desktop-header {
    grid-column: 1 / 4;
    border-bottom: 1px solid var(--color-fill-separator);
  }

  .sidebar {
    grid-column: 1 / 2;
    border-right: 1px solid var(--color-fill-separator);
  }

  .content {
    grid-column: 2 / 3;
    overflow: scroll;
  }

  .mobile-footer {
    display: none;
  }

  @media (max-width: 719.98px) {
    .desktop-header {
      display: none;
    }
    .content {
      overflow-y: scroll;
      overflow-x: hidden;
    }
    .mobile-footer {
      margin-top: auto;
      display: grid;
      grid-column: 1 / 4;
      background-color: pink;
    }
  }
</style>

<div class="layout">
  <div class="desktop-header">
    <AppHeader />
  </div>

  <div class="sidebar global-hide-on-medium-desktop-down">
    <Sidebar {node} {activeTab} {baseUrl} {project} />
  </div>

  <div class="sidebar global-hide-on-mobile-down global-hide-on-desktop-up">
    <Sidebar {node} {activeTab} {baseUrl} {project} collapsedOnly />
  </div>

  <div class="content" style:padding-bottom={stylePaddingBottom}>
    <slot name="header" />
    <slot name="subheader" />
    <slot />
  </div>

  <div class="mobile-footer">
    <MobileFooter>
      <div style:width="100%">
        <Link
          title="Home"
          route={{
            resource: "project.source",
            project: project.id,
            node: baseUrl,
            path: "/",
          }}>
          <Button
            variant={activeTab === "source" ? "secondary" : "secondary-mobile"}
            styleWidth="100%">
            <IconSmall name="chevron-left-right" />
          </Button>
        </Link>
      </div>

      <div style:width="100%">
        <Link
          title={`${project.issues.open} Issues`}
          route={{
            resource: "project.issues",
            project: project.id,
            node: baseUrl,
          }}>
          <Button
            variant={activeTab === "issues" ? "secondary" : "secondary-mobile"}
            styleWidth="100%">
            <IconSmall name="issue" />
          </Button>
        </Link>
      </div>

      <div style:width="100%">
        <Link
          title={`${project.patches.open} Patches`}
          route={{
            resource: "project.patches",
            project: project.id,
            node: baseUrl,
          }}>
          <Button
            variant={activeTab === "patches" ? "secondary" : "secondary-mobile"}
            styleWidth="100%">
            <IconSmall name="patch" />
          </Button>
        </Link>
      </div>
    </MobileFooter>
  </div>
</div>
