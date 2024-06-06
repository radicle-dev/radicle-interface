<script lang="ts">
  import type { ActiveTab } from "./Header.svelte";
  import type { BaseUrl, Node, Project } from "@http-client";

  import { onMount } from "svelte";

  import { experimental } from "@app/lib/appearance";
  import { httpdStore, api } from "@app/lib/httpd";
  import { isLocal } from "@app/lib/utils";
  import { queryProject } from "@app/lib/projects";

  import Button from "@app/components/Button.svelte";
  import ContextHelp from "@app/views/projects/Sidebar/ContextHelp.svelte";
  import ContextRepo from "@app/views/projects/Sidebar/ContextRepo.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Link from "@app/components/Link.svelte";
  import Loading from "@app/components/Loading.svelte";
  import Popover from "@app/components/Popover.svelte";

  import Help from "@app/App/Help.svelte";
  import Settings from "@app/App/Settings.svelte";

  const SIDEBAR_STATE_KEY = "sidebarState";

  export let activeTab: ActiveTab | undefined = undefined;
  export let node: Node;
  export let baseUrl: BaseUrl;
  export let project: Project;
  export let collapsedOnly = false;

  let expanded = collapsedOnly ? false : loadSidebarState();

  export function storeSidebarState(expanded: boolean): void {
    window.localStorage.setItem(
      SIDEBAR_STATE_KEY,
      expanded ? "expanded" : "collapsed",
    );
  }

  // To avoid concurrent request.
  let queryingLocalProject: boolean = true;
  let localProject: "notFound" | "found" | undefined = undefined;
  $: hideContextHelp =
    $experimental &&
    isLocal(baseUrl.hostname) &&
    $httpdStore.state === "authenticated";

  httpdStore.subscribe(async () => {
    if ($httpdStore.state !== "stopped" && !queryingLocalProject) {
      await detectLocalProject();
    }
  });

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

  async function detectLocalProject(): Promise<void> {
    queryingLocalProject = true;
    localProject = await queryProject(api.baseUrl, project.id);
    queryingLocalProject = false;
  }

  onMount(async () => {
    if ($httpdStore.state !== "stopped") {
      await detectLocalProject();
    } else {
      localProject = "notFound";
    }
  });
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
  .repo,
  .help {
    z-index: 10;
    opacity: 1;
    transition:
      opacity 150ms,
      display 150ms allow-discrete;
    transition-delay: 150ms;
  }
  .help-box {
    width: 100%;
    padding: 1rem;
    margin-bottom: 0.5rem;
    background-color: var(--color-background-float);
    border: 1px solid var(--color-border-hint);
    font-size: var(--font-size-small);
    border-radius: var(--border-radius-small);
  }
  .repo-box {
    margin-bottom: 0.5rem;
  }
  .vertical-buttons {
    opacity: 1;
    height: fit-content;
    display: flex;
    flex-direction: column-reverse;
    transition:
      opacity 150ms ease-in-out,
      display 150ms ease-in-out allow-discrete;
    transition-delay: 60ms;
    margin-bottom: 0.5rem;
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
  .collapse-label {
    display: none;
  }
  .collapse-label.expanded {
    display: block;
    transition: opacity 30ms ease-in-out;
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
        styleJustifyContent={"flex-start"}
        variant={activeTab === "source" ? "gray" : "background"}>
        <IconSmall name="chevron-left-right" />
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
        styleJustifyContent={"flex-start"}
        styleWidth="100%"
        variant={activeTab === "issues" ? "gray" : "background"}>
        <IconSmall name="issue" />
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
        styleJustifyContent={"flex-start"}
        variant={activeTab === "patches" ? "gray" : "background"}>
        <IconSmall name="patch" />
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
    {#if expanded}
      <div class="help">
        {#if !hideContextHelp && $experimental}
          {#if !localProject}
            <div
              style="display: flex; justify-content: center; align-items: center; height: 2rem;">
              <Loading small />
            </div>
          {:else}
            <div class="help-box">
              <ContextHelp
                {localProject}
                {baseUrl}
                projectId={project.id}
                hideLocalButton={isLocal(baseUrl.hostname) ||
                  localProject !== "found"}
                disableLocalButton={$httpdStore.state !== "authenticated"} />
            </div>
          {/if}
        {/if}
      </div>
      <div class="repo">
        <div class="repo-box">
          <ContextRepo {project} {baseUrl} {node} />
        </div>
      </div>
    {:else}
      <div class="vertical-buttons" style:gap="0.5rem">
        <Popover popoverPositionBottom="0" popoverPositionLeft="3rem">
          <Button
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

        <Popover popoverPositionBottom="0" popoverPositionLeft="2rem">
          <Button
            stylePadding="0 0.75rem"
            variant="background"
            title="Info"
            slot="toggle"
            let:toggle
            on:click={toggle}>
            <IconSmall name="info" />
          </Button>

          <div slot="popover">
            <ContextRepo disablePopovers {node} {baseUrl} {project} />
          </div>
        </Popover>

        {#if !hideContextHelp && $experimental}
          {#if !localProject}
            <div
              style="display: flex; justify-content: center; align-items: center; height: 2rem;">
              <Loading small condensed />
            </div>
          {:else}
            <Popover popoverPositionBottom="0" popoverPositionLeft="3rem">
              <Button
                stylePadding="0 0.75rem"
                variant="background"
                title="Local node"
                slot="toggle"
                let:toggle
                on:click={toggle}>
                <IconSmall name="device" />
              </Button>

              <ContextHelp
                {localProject}
                {baseUrl}
                popover
                projectId={project.id}
                hideLocalButton={isLocal(baseUrl.hostname) ||
                  localProject !== "found"}
                disableLocalButton={$httpdStore.state !== "authenticated"}
                slot="popover" />
            </Popover>
          {/if}
        {/if}
      </div>
    {/if}
    <!-- Footer -->
    {#if !collapsedOnly}
      <div class="sidebar-footer" style:flex-direction="row">
        <Button
          title={"Collapse"}
          on:click={toggleSidebar}
          variant="background">
          <div class="icon" class:expanded>
            <IconSmall name="chevron-left" />
          </div>
          <span class="collapse-label" class:expanded>Collapse</span>
        </Button>
        <div class="horizontal-buttons" class:expanded>
          <Popover popoverPositionBottom="2.5rem" popoverPositionLeft="0">
            <Button
              variant="background"
              title="Settings"
              slot="toggle"
              let:toggle
              on:click={toggle}>
              <IconSmall name="settings" />
              Settings
            </Button>

            <Settings slot="popover" />
          </Popover>
        </div>
        <div class="horizontal-buttons" class:expanded>
          <Popover popoverPositionBottom="2.5rem" popoverPositionLeft="0">
            <Button
              variant="background"
              title="Help"
              slot="toggle"
              let:toggle
              on:click={toggle}>
              <IconSmall name="help" />
              Help
            </Button>
            <Help slot="popover" />
          </Popover>
        </div>
      </div>
    {/if}
  </div>
</div>
