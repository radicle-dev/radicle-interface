<script lang="ts">
  import type { ActiveTab } from "./Header.svelte";
  import type { BaseUrl, Project, SeedingPolicy } from "@http-client";

  import Button from "@app/components/Button.svelte";
  import ContextRepo from "@app/views/projects/Sidebar/ContextRepo.svelte";
  import Help from "@app/App/Help.svelte";
  import Icon from "@app/components/Icon.svelte";
  import Link from "@app/components/Link.svelte";
  import Popover from "@app/components/Popover.svelte";
  import Settings from "@app/App/Settings.svelte";

  const SIDEBAR_STATE_KEY = "sidebarState";

  export let activeTab: ActiveTab | undefined = undefined;
  export let seedingPolicy: SeedingPolicy;
  export let baseUrl: BaseUrl;
  export let project: Project;
  export let collapsedOnly = false;

  let expanded = collapsedOnly ? false : loadSidebarState();

  export function storeSidebarState(expanded: boolean): void {
    if (localStorage) {
      localStorage.setItem(
        SIDEBAR_STATE_KEY,
        expanded ? "expanded" : "collapsed",
      );
    } else {
      console.warn(
        "localStorage isn't available, not able to persist the sidebar state without it.",
      );
    }
  }

  function loadSidebarState(): boolean {
    const storedSidebarState = localStorage
      ? localStorage.getItem(SIDEBAR_STATE_KEY)
      : null;

    if (storedSidebarState === null) {
      return true;
    } else {
      return storedSidebarState === "expanded" ? true : false;
    }
  }

  function toggleSidebar() {
    expanded = !expanded;
    storeSidebarState(expanded);
  }
</script>

<style>
  .sidebar {
    padding: 1rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: width 150ms ease-in-out;
    width: 4.5rem;
  }
  .sidebar.expanded {
    width: 22.5rem;
  }
  .project-navigation {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
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
    overflow: hidden;
    gap: 0.5rem;
    justify-content: space-between;
    width: 100%;
    opacity: 0;
    transition: opacity 150ms ease-in-out;
  }
  .title-counter.expanded {
    opacity: 1;
  }
  .sidebar-footer {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
  .repo {
    z-index: 10;
    opacity: 0;
    height: 0;
    overflow: hidden;
  }
  .box {
    padding: 1rem;
    margin-bottom: 0.5rem;
    background-color: var(--color-background-float);
    border: 1px solid var(--color-border-hint);
    font-size: var(--font-size-small);
    border-radius: var(--border-radius-small);
  }
  .repo.expanded {
    opacity: 1;
    height: initial;
    overflow: initial;
    transition: opacity 150ms;
    transition-delay: 150ms;
  }
  .vertical-buttons {
    opacity: 1;
    height: fit-content;
    display: flex;
    flex-direction: column-reverse;
    transition: opacity 150ms ease-in-out;
    transition-delay: 60ms;
    margin-bottom: 0.5rem;
  }
  .vertical-buttons.expanded {
    opacity: 0;
    height: 0;
    overflow: hidden;
  }
  .horizontal-buttons {
    display: flex;
    gap: 0.5rem;
    opacity: 0;
    transition: opacity 30ms ease-in-out;
  }
  .horizontal-buttons.expanded {
    opacity: 1;
    transition: opacity 150ms ease-in-out;
  }
  .icon {
    transform: rotate(180deg);
    transition: transform 150ms ease-in-out;
  }
  .icon.expanded {
    transform: rotate(0deg);
  }
  .bottom {
    display: flex;
    flex-direction: column;
    justify-items: flex-end;
  }
</style>

<div class="sidebar" class:expanded>
  <!-- Top Navigation Items -->
  <div class="project-navigation">
    <Link
      title="Source"
      route={{
        resource: "project.source",
        project: project.id,
        node: baseUrl,
        path: "/",
      }}>
      <Button
        stylePadding="0.5rem 0.75rem"
        size="large"
        styleWidth="100%"
        styleJustifyContent="flex-start"
        variant={activeTab === "source" ? "gray" : "background"}>
        <Icon name="chevron-left-right" />
        <span class="title-counter" class:expanded>Source</span>
      </Button>
    </Link>
    <Link
      title={`${project.issues.open} Issues`}
      route={{
        resource: "project.issues",
        project: project.id,
        node: baseUrl,
      }}>
      <Button
        stylePadding="0.5rem 0.75rem"
        let:hover
        size="large"
        styleJustifyContent="flex-start"
        styleWidth="100%"
        variant={activeTab === "issues" ? "gray" : "background"}>
        <Icon name="issue" />
        <div class="title-counter" class:expanded>
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
      title={`${project.patches.open} Patches`}
      route={{
        resource: "project.patches",
        project: project.id,
        node: baseUrl,
      }}>
      <Button
        stylePadding="0.5rem 0.75rem"
        let:hover
        size="large"
        styleWidth="100%"
        styleJustifyContent="flex-start"
        variant={activeTab === "patches" ? "gray" : "background"}>
        <Icon name="patch" />
        <div class="title-counter" class:expanded>
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
  <!-- Context and other information section -->
  <div class="bottom">
    <div class="repo box" class:expanded>
      <ContextRepo
        projectThreshold={project.threshold}
        projectDelegates={project.delegates}
        {seedingPolicy} />
    </div>
    <div class="vertical-buttons" class:expanded style:gap="0.5rem">
      <Popover popoverPositionBottom="0" popoverPositionLeft="3rem">
        <Button
          stylePadding="0 0.75rem"
          variant="background"
          title="Settings"
          slot="toggle"
          let:toggle
          on:click={toggle}>
          <Icon name="settings" />
        </Button>

        <Settings slot="popover" />
      </Popover>

      <Popover popoverPositionBottom="0" popoverPositionLeft="3rem">
        <Button
          stylePadding="0 0.75rem"
          variant="background"
          title="Help"
          slot="toggle"
          let:toggle
          on:click={toggle}>
          <Icon name="help" />
        </Button>

        <Help slot="popover" />
      </Popover>

      <Popover popoverPositionBottom="0" popoverPositionLeft="3rem">
        <Button
          stylePadding="0 0.75rem"
          variant="background"
          title="Info"
          slot="toggle"
          let:toggle
          on:click={toggle}>
          <Icon name="info" />
        </Button>

        <div slot="popover" class="txt-small" style:width="18rem">
          <ContextRepo
            projectThreshold={project.threshold}
            projectDelegates={project.delegates}
            {seedingPolicy} />
        </div>
      </Popover>
    </div>
    <!-- Footer -->
    {#if !collapsedOnly}
      <div class="sidebar-footer" style:flex-direction="row">
        <Button
          title={"Collapse"}
          on:click={toggleSidebar}
          variant="background">
          <div class="icon" class:expanded>
            <Icon name="chevron-left" />
          </div>
        </Button>
        <div class="global-flex-item">
          <div class="horizontal-buttons" class:expanded>
            <Popover popoverPositionBottom="2.5rem" popoverPositionLeft="0">
              <Button
                variant="outline"
                title="Settings"
                slot="toggle"
                let:toggle
                on:click={toggle}>
                <Icon name="settings" />
                Settings
              </Button>

              <Settings slot="popover" />
            </Popover>
          </div>
          <div class="horizontal-buttons" class:expanded>
            <Popover popoverPositionBottom="2.5rem" popoverPositionLeft="0">
              <Button
                variant="outline"
                title="Help"
                slot="toggle"
                let:toggle
                on:click={toggle}>
                <Icon name="help" />
                Help
              </Button>
              <Help slot="popover" />
            </Popover>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
