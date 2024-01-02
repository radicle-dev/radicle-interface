<script lang="ts">
  import type { ActiveTab } from "./Header.svelte";
  import type { BaseUrl, Project } from "@httpd-client";
  import type { SvelteComponent } from "svelte";

  import { onMount } from "svelte";

  import Button from "@app/components/Button.svelte";
  import Clipboard from "@app/components/Clipboard.svelte";
  import CopyableId from "@app/components/CopyableId.svelte";
  import IconButton from "@app/components/IconButton.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Link from "@app/components/Link.svelte";
  import Popover from "@app/components/Popover.svelte";

  import Help from "@app/App/Help.svelte";
  import Settings from "@app/App/Settings.svelte";

  const SIDEBAR_STATE_KEY = "sidebarState";

  export let activeTab: ActiveTab | undefined = undefined;
  export let baseUrl: BaseUrl;
  export let project: Project;

  let expanded = true;

  export function storeSidebarState(expanded: boolean): void {
    window.localStorage.setItem(
      SIDEBAR_STATE_KEY,
      expanded ? "expanded" : "collapsed",
    );
  }

  function loadSidebarState(): boolean {
    const storedSidebarState = window.localStorage.getItem(SIDEBAR_STATE_KEY);

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

  onMount(() => {
    expanded = loadSidebarState();
  });

  let clipboard: SvelteComponent;
</script>

<style>
  .sidebar {
    padding: 1rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .id {
    border-radius: var(--border-radius-small);
    border: 1px solid var(--color-border-hint);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .project-navigation {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
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
  .sidebar-footer {
    display: flex;
    justify-content: space-between;
    width: 100%;
    gap: 0.25rem;
  }
</style>

<div class="sidebar">
  {#if expanded}
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <div class="id" style:padding="0.5rem 0.75rem">
        <CopyableId id={project.id} />
      </div>
      <div class="project-navigation">
        <Link
          title="Home"
          route={{
            resource: "project.source",
            project: project.id,
            node: baseUrl,
            path: "/",
          }}>
          <Button
            size="large"
            styleWidth="100%"
            styleJustifyContent={"flex-start"}
            variant={activeTab === "source" ? "gray" : "background"}>
            <IconSmall name="home" />
            Home
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
            let:hover
            size="large"
            styleJustifyContent={"flex-start"}
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
          title={`${project.patches.open} Patches`}
          route={{
            resource: "project.patches",
            project: project.id,
            node: baseUrl,
          }}>
          <Button
            let:hover
            size="large"
            styleWidth="100%"
            styleJustifyContent={"flex-start"}
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
    </div>

    <div class="sidebar-footer" style:flex-direction="row">
      <IconButton title={"Collapse"} on:click={toggleSidebar}>
        <IconSmall name="chevron-left" /> Collapse
      </IconButton>

      <Popover popoverPositionBottom="2rem" popoverPositionLeft="0">
        <IconButton title="Settings" slot="toggle" let:toggle on:click={toggle}>
          <IconSmall name="settings" />
          Settings
        </IconButton>

        <Settings slot="popover" />
      </Popover>

      <Popover popoverPositionBottom="2rem" popoverPositionLeft="0">
        <IconButton title="Help" slot="toggle" let:toggle on:click={toggle}>
          <IconSmall name="help" />
          Help
        </IconButton>

        <Help slot="popover" />
      </Popover>
    </div>
  {:else}
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        title="Copy RID to clipboard"
        class="id"
        style:color="var(--color-fill-secondary)"
        style:cursor="pointer"
        style:padding="0.5rem 0"
        role="button"
        tabindex="0"
        on:click={() => {
          clipboard.copy();
        }}>
        <Clipboard bind:this={clipboard} text={project.id} />
      </div>
      <div class="project-navigation">
        <Link
          title="Home"
          route={{
            resource: "project.source",
            project: project.id,
            node: baseUrl,
            path: "/",
          }}>
          <Button
            size="large"
            stylePadding="0 0.75rem"
            variant={activeTab === "source" ? "gray" : "background"}>
            <IconSmall name="home" />
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
            size="large"
            stylePadding="0 0.75rem"
            variant={activeTab === "issues" ? "gray" : "background"}>
            <IconSmall name="issue" />
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
            size="large"
            stylePadding="0 0.75rem"
            variant={activeTab === "patches" ? "gray" : "background"}>
            <IconSmall name="patch" />
          </Button>
        </Link>
      </div>
    </div>

    <div class="sidebar-footer" style:flex-direction="column-reverse">
      <Button
        size="large"
        stylePadding="0 0.75rem"
        variant="background"
        title={"Expand"}
        on:click={toggleSidebar}>
        <IconSmall name="chevron-right" />
      </Button>

      <Popover popoverPositionBottom="0" popoverPositionLeft="3rem">
        <Button
          size="large"
          stylePadding="0 0.75rem"
          variant="background"
          title="Settings"
          slot="toggle"
          let:toggle
          on:click={toggle}>
          <IconSmall name="settings" />
        </Button>

        <Settings slot="popover" />
      </Popover>

      <Popover popoverPositionBottom="0" popoverPositionLeft="3rem">
        <Button
          size="large"
          stylePadding="0 0.75rem"
          variant="background"
          title="Help"
          slot="toggle"
          let:toggle
          on:click={toggle}>
          <IconSmall name="help" />
        </Button>

        <Help slot="popover" />
      </Popover>
    </div>
  {/if}
</div>
