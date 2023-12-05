<script lang="ts">
  import type { ActiveTab } from "./Header.svelte";
  import type { BaseUrl, Project } from "@httpd-client";
  import type { SvelteComponent } from "svelte";

  import { onMount } from "svelte";

  import AppHeader from "@app/App/Header.svelte";
  import Clipboard from "@app/components/Clipboard.svelte";
  import CopyableId from "@app/components/CopyableId.svelte";
  import ExternalLink from "@app/components/ExternalLink.svelte";

  import Button from "@app/components/Button.svelte";
  import IconButton from "@app/components/IconButton.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import KeyHint from "@app/components/KeyHint.svelte";
  import Link from "@app/components/Link.svelte";
  import Popover from "@app/components/Popover.svelte";
  import RadworksLogo from "@app/components/RadworksLogo.svelte";
  import ThemeSettings from "@app/App/Header/ThemeSettings.svelte";
  import MobileFooter from "@app/App/MobileFooter.svelte";

  export let activeTab: ActiveTab = undefined;
  export let baseUrl: BaseUrl;
  export let project: Project;
  export let styleRightContentPadding: string = "1rem";
  export let styleContentMargin: string = "1rem 0 0 0";

  let expanded = true;

  const SIDEBAR_STATE_KEY = "sidebarState";
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

  onMount(() => {
    expanded = loadSidebarState();
  });
  let clipboard: SvelteComponent;

  let outerWidth: number;
  let rightContentMaxWidth: string;
  let rightContentMargin: string;

  $: if (outerWidth <= 720) {
    rightContentMaxWidth = "unset";
    rightContentMargin = "0 0 3rem 0";
  } else {
    if (expanded) {
      rightContentMaxWidth = `calc(100vw - 23rem)`;
      rightContentMargin = "3.5rem 0 0 22.5rem";
    } else {
      rightContentMaxWidth = `calc(100vw - 4.5rem)`;
      rightContentMargin = "3.5rem 0 0 4.5rem";
    }
  }
</script>

<style>
  .layout {
    display: flex;
  }
  .expanded {
    width: 22.5rem;
    position: fixed;
    height: 100%;
    justify-content: space-between;
    display: flex;
    flex-direction: column;
    top: 0;
    left: 0;
    padding: 4.5rem 1rem 1rem 1rem;
    border-right: 1px solid var(--color-fill-separator);
    z-index: 1;
  }
  .collapsed {
    width: 4.5rem;
    position: fixed;
    height: 100%;
    justify-content: space-between;
    display: flex;
    flex-direction: column;
    top: 0;
    left: 0;
    padding: 4.5rem 1rem 1rem 1rem;
    border-right: 1px solid var(--color-fill-separator);
    z-index: 1;
  }
  .right-content {
    margin-top: 3.5rem;
    width: 100%;
  }
  .footer {
    display: flex;
    justify-content: space-between;
    width: 100%;
    gap: 1rem;
  }
  .content {
    width: 100%;
    max-width: var(--content-max-width);
    min-width: var(--content-min-width);
  }
  .id {
    border-radius: var(--border-radius-regular);
    border: 1px solid var(--color-border-hint);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .header-container {
    border-bottom: 1px solid var(--color-fill-separator);
    background-color: var(--color-background-default);
    width: 100%;
    position: fixed;
    z-index: 2;
  }
  .help {
    font-size: var(--font-size-small);
    color: var(--color-foreground-dim);
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .help-item {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
  .logo {
    color: var(--color-foreground-contrast);
  }
  .divider {
    border-bottom: 1px solid var(--color-fill-separator);
  }
  a:hover {
    color: var(--color-fill-secondary);
  }

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

<svelte:window bind:outerWidth />

<div class="header-container">
  <AppHeader />
</div>

<div class="layout">
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="sidebar global-hide-on-mobile">
    <div class={expanded ? "expanded" : "collapsed"}>
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        {#if expanded}
          <div class="id" style:padding="0.5rem 0.75rem">
            <CopyableId id={project.id} />
          </div>
        {:else}
          <div
            title="Copy RID to clipboard"
            class="id"
            style:color="var(--color-fill-secondary)"
            style:cursor="pointer"
            style:padding="0.5rem 1rem"
            role="button"
            tabindex="0"
            on:click={() => {
              clipboard.copy();
            }}>
            <Clipboard bind:this={clipboard} text={project.id} />
          </div>
        {/if}
        <div class="container">
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
              styleJustifyContent={expanded ? "flex-start" : "center"}
              variant={activeTab === "source" ? "gray" : "background"}>
              <IconSmall name="home" />
              {#if expanded}
                Home
              {/if}
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
              styleJustifyContent={expanded ? "flex-start" : "center"}
              styleWidth="100%"
              variant={activeTab === "issues" ? "gray" : "background"}>
              <IconSmall name="issue" />
              {#if expanded}
                <div class="title-counter">
                  Issues
                  <span
                    class="counter"
                    class:selected={activeTab === "issues"}
                    class:hover={hover && activeTab !== "issues"}>
                    {project.issues.open}
                  </span>
                </div>
              {/if}
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
              styleJustifyContent={expanded ? "flex-start" : "center"}
              variant={activeTab === "patches" ? "gray" : "background"}>
              <IconSmall name="patch" />
              {#if expanded}
                <div class="title-counter">
                  Patches
                  <span
                    class="counter"
                    class:hover={hover && activeTab !== "patches"}
                    class:selected={activeTab === "patches"}>
                    {project.patches.open}
                  </span>
                </div>
              {/if}
            </Button>
          </Link>
        </div>
      </div>

      <div
        class="footer"
        style:flex-direction={expanded ? "row" : "column-reverse"}>
        <IconButton
          title={expanded ? "Collapse" : "Expand"}
          on:click={() => {
            expanded = !expanded;
            storeSidebarState(expanded);
          }}>
          {#if expanded}
            <IconSmall name="chevron-left" /> Collapse
          {:else}
            <IconSmall name="chevron-right" />
          {/if}
        </IconButton>
        <Popover popoverPositionBottom="2rem" popoverPositionLeft="0">
          <IconButton
            title="Settings"
            slot="toggle"
            let:toggle
            on:click={toggle}>
            <IconSmall name="settings" />
            {#if expanded}
              Settings
            {/if}
          </IconButton>

          <div slot="popover" style:width="18.5rem">
            <ThemeSettings />
          </div>
        </Popover>

        <Popover popoverPositionBottom="2rem" popoverPositionLeft="0">
          <IconButton title="Help" slot="toggle" let:toggle on:click={toggle}>
            <IconSmall name="help" />
            {#if expanded}
              Help
            {/if}
          </IconButton>

          <div slot="popover" style:width="18.5rem">
            <div class="help">
              <div class="help-item">
                Supported by
                <a
                  class="logo"
                  target="_blank"
                  rel="noreferrer"
                  href="https://radworks.org">
                  <RadworksLogo />
                </a>
              </div>
              <div class="help-item">
                About
                <ExternalLink href="https://radicle.xyz">
                  radicle.xyz
                </ExternalLink>
              </div>
              <div class="divider" />
              <div class="help-item">
                Keyboard shortcuts <KeyHint>?</KeyHint>
              </div>
            </div>
          </div>
        </Popover>
      </div>
    </div>
  </div>

  <div
    class="right-content"
    style:padding={styleRightContentPadding}
    style:max-width={rightContentMaxWidth}
    style:margin={rightContentMargin}>
    <slot name="header" />
    <slot name="subheader" />

    <div class="content" style:margin={styleContentMargin}>
      <slot />
    </div>
  </div>
</div>

<div class="global-hide-on-desktop">
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
          <IconSmall name="home" />
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
