<script lang="ts">
  import type { BaseUrl, NodeIdentity, NodeStats } from "@http-client";

  import * as router from "@app/lib/router";
  import * as utils from "@app/lib/utils";
  import { fetchProjectInfos } from "@app/components/ProjectCard";
  import { handleError } from "@app/views/nodes/error";

  import Avatar from "@app/components/Avatar.svelte";
  import Badge from "@app/components/Badge.svelte";
  import Button from "@app/components/Button.svelte";
  import Command from "@app/components/Command.svelte";
  import ExternalLink from "@app/components/ExternalLink.svelte";
  import Help from "@app/App/Help.svelte";
  import Icon from "@app/components/Icon.svelte";
  import Id from "@app/components/Id.svelte";
  import Link from "@app/components/Link.svelte";
  import Loading from "@app/components/Loading.svelte";
  import MobileFooter from "@app/App/MobileFooter.svelte";
  import Placeholder from "@app/components/Placeholder.svelte";
  import Popover from "@app/components/Popover.svelte";
  import ProjectCard from "@app/components/ProjectCard.svelte";
  import Separator from "@app/views/projects/Separator.svelte";
  import Settings from "@app/App/Settings.svelte";
  import UserAddress from "@app/views/users/UserAddress.svelte";

  export let baseUrl: BaseUrl;
  export let node: NodeIdentity;
  export let did: { prefix: string; pubkey: string };
  export let nodeAvatarUrl: string | undefined;
  export let stats: NodeStats;
</script>

<style>
  .layout {
    display: grid;
    grid-template-rows: 3.5rem 1fr auto;
    grid-template-columns: 30rem auto;
    grid-template-areas:
      "header header"
      "sidebar main"
      "footer main";
    height: 100vh;
  }
  header {
    grid-area: header;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.5rem 0.5rem 1rem;
    justify-content: space-between;
    outline: 1px solid var(--color-fill-separator) !important;
  }

  .breadcrumbs {
    display: flex;
    align-items: center;
    column-gap: 0.25rem;
    line-height: 1rem;
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-small);
    white-space: nowrap;
    flex-wrap: wrap;
  }
  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  .breadcrumb :global(a:hover) {
    color: var(--color-fill-secondary);
  }

  .sidebar {
    grid-area: sidebar;
    border-right: 1px solid var(--color-fill-separator);
    width: 30rem;
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    z-index: 1;
  }
  .sidebar-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 2rem;
  }
  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-small);
  }
  .empty-state,
  .loading {
    height: 100%;
  }

  .content {
    overflow-y: scroll;
    grid-area: main;
  }
  .wrapper {
    height: 100%;
    margin: 0 auto;
    max-width: 78rem;
    padding: 1.5rem;
  }

  .logo {
    height: var(--button-regular-height);
    margin: 0 0.5rem;
  }

  .mobile-footer {
    display: none;
  }
  .footer {
    display: flex;
    border-right: 1px solid var(--color-fill-separator);
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
  }
  .subtitle {
    font-size: var(--font-size-small);
    color: var(--color-foreground-dim);
    padding: 1rem 0;
  }
  .avatar {
    border-radius: var(--border-radius-tiny);
    margin-right: 0.5rem;
  }

  .user-info {
    display: grid;
    grid-template-columns: 64px minmax(0, 30rem) max-content;
    column-gap: 1rem;
    margin-bottom: 1.5rem;
  }
  .follow-label {
    display: block;
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-regular);
    margin-bottom: 0.75rem;
  }
  .id {
    max-width: 22rem;
  }
  .repo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(21rem, 1fr));
    gap: 1rem;
  }
  @media (max-width: 1010.98px) {
    .wrapper {
      padding: 1.5rem;
    }
    .sidebar {
      width: 325px;
    }
    .id {
      max-width: 12rem;
    }
    .layout {
      grid-template-columns: 325px auto;
      grid-template-areas:
        "header header"
        "sidebar main"
        "footer main";
    }
  }

  @media (max-width: 719.98px) {
    .layout {
      grid-template-columns: 1fr;
      grid-template-areas:
        "main"
        "main"
        "footer";
    }
    header {
      display: none;
    }
    .content {
      overflow-x: hidden;
      margin-left: 0;
    }
    .wrapper {
      padding: 1rem;
    }
    .empty-state,
    .loading {
      height: calc(100% - 6rem);
    }
    .footer {
      display: none;
    }
    .mobile-footer {
      grid-area: footer;
      margin-top: auto;
      display: grid;
      grid-column: 1 / 4;
    }
  }
</style>

<div class="layout">
  <header>
    <div class="breadcrumbs">
      <span class="breadcrumb">
        <Link
          style="display: flex; align-items: center; gap: 0.25rem;"
          route={{
            resource: "nodes",
            params: {
              baseUrl,
              projectPageIndex: 0,
            },
          }}>
          <img
            width="24"
            height="24"
            class="avatar"
            alt="Radicle logo"
            src={nodeAvatarUrl
              ? nodeAvatarUrl
              : "/images/default-seed-avatar.png"} />
          {baseUrl.hostname}
        </Link>
      </span>

      <Separator />

      <span class="breadcrumb">
        <Link route={{ resource: "users", did: utils.formatDid(did), baseUrl }}>
          <div class="breadcrumb" title={utils.formatDid(did)}>
            {node.alias || utils.formatNodeId(did.pubkey)}
          </div>
        </Link>
      </span>
    </div>
    <Link
      style="display: flex; align-items: center;"
      route={{ resource: "nodes", params: undefined }}>
      <img
        width="24"
        height="24"
        class="logo"
        alt="Radicle logo"
        src="/radicle.svg" />
    </Link>
  </header>

  <div class="sidebar global-hide-on-mobile-down">
    <div class="user-info">
      <div style:margin-right="0.5rem">
        <Avatar nodeId={did.pubkey} variant="large" />
      </div>
      <div style:margin-top="0.25rem">
        <div class="txt-medium txt-semibold txt-overflow">
          {node.alias || utils.formatNodeId(did.pubkey)}
        </div>
        <div style:margin-top="0.25rem">
          <UserAddress {did} />
        </div>
      </div>
      <div class="global-hide-on-small-desktop-down" style="justify-self: end;">
        <Popover popoverPositionTop="2.5rem">
          <Button
            slot="toggle"
            let:toggle
            on:click={toggle}
            variant="secondary">
            <div class="global-flex-item">
              <Icon name="plus" />
              <span>Follow</span>
            </div>
          </Button>
          <div slot="popover" style:width="24rem">
            <span class="follow-label">
              Use the <ExternalLink href="https://radicle.xyz">
                Radicle CLI
              </ExternalLink> to start following this user.
            </span>
            <span class="follow-label">
              Following a user ensures that their contributions are fetched onto
              your device.
            </span>
            <Command command={`rad follow ${did.pubkey}`} />
          </div>
        </Popover>
      </div>
    </div>
    <div style:margin-bottom="1rem">
      <div class="sidebar-item txt-small">
        <span>SSH Key</span>
        <Id id={node.ssh.full}>
          <div class="id txt-overflow">{node.ssh.full}</div>
        </Id>
      </div>
      <div class="sidebar-item txt-small">
        <span>SSH Hash</span>
        <Id id={node.ssh.hash}>
          <div class="id txt-overflow">{node.ssh.hash}</div>
        </Id>
      </div>
    </div>
  </div>
  <div class="footer">
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

  <div class="content">
    <div class="wrapper">
      <div class="global-hide-on-small-desktop-up user-info">
        <div style:margin-right="0.5rem">
          <Avatar nodeId={did.pubkey} variant="large" />
        </div>
        <div style:margin-top="0.25rem">
          <div class="txt-medium txt-semibold txt-overflow">
            {node.alias || utils.formatNodeId(did.pubkey)}
          </div>
          <div style:margin-top="0.25rem">
            <UserAddress {did} />
          </div>
        </div>
      </div>

      {#await fetchProjectInfos(baseUrl, { show: "all", perPage: stats.repos.total }, utils.formatDid(did))}
        <div class="loading">
          <Loading small center />
        </div>
      {:then repos}
        {#if repos.length > 0}
          <div class="repo-grid">
            {#each repos as projectInfo}
              <ProjectCard {projectInfo}>
                <svelte:fragment slot="delegate">
                  <Badge
                    title={`${node.alias || utils.formatNodeId(did.pubkey)} is a delegate of this repository`}
                    round
                    variant="delegate"
                    size="tiny"
                    style="padding: 0 0.372rem; gap: 0.125rem;">
                    <Icon name="badge" />
                  </Badge>
                </svelte:fragment>
              </ProjectCard>
            {/each}
          </div>
          <div class="subtitle">
            {repos.length}
            {repos.length === 1 ? "repository" : "repositories"}
          </div>
        {:else}
          <div class="empty-state">
            <Placeholder
              iconName="desert"
              caption="This user doesn't have any repositories on this node." />
          </div>
        {/if}
      {:catch error}
        {router.push(handleError(error, utils.baseUrlToString(baseUrl)))}
      {/await}
    </div>
  </div>
  <div class="mobile-footer">
    <MobileFooter>
      <div style:width="100%">
        <Popover popoverPositionBottom="3rem" popoverPositionRight="-7.5rem">
          <Button
            let:expanded
            slot="toggle"
            variant={expanded ? "secondary" : "secondary-mobile-toggle"}
            styleWidth="100%"
            let:toggle
            on:click={toggle}>
            <Icon name="info" />
          </Button>

          <div slot="popover" style:width="20rem">
            <div class="sidebar-item txt-small">
              <span>SSH Key</span>
              <Id id={node.ssh.full}>
                <div class="id txt-overflow">{node.ssh.full}</div>
              </Id>
            </div>
            <div class="sidebar-item txt-small">
              <span>SSH Hash</span>
              <Id id={node.ssh.hash}>
                <div class="id txt-overflow">{node.ssh.hash}</div>
              </Id>
            </div>
          </div>
        </Popover>
      </div>
    </MobileFooter>
  </div>
</div>
