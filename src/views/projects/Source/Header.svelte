<script lang="ts">
  import type { BaseUrl, Project, Remote, Tree } from "@httpd-client";
  import { type Route } from "@app/lib/router";

  import BranchSelector from "./BranchSelector.svelte";
  import PeerSelector from "./PeerSelector.svelte";

  import Button from "@app/components/Button.svelte";
  import HoverPopover from "@app/components/HoverPopover.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Link from "@app/components/Link.svelte";

  export let node: BaseUrl;
  export let branches: Array<{ name: string; route: Route }>;
  export let peers: Array<{ remote: Remote; selected: boolean; route: Route }>;
  export let filesLinkActive: boolean;
  export let historyLinkActive: boolean;
  export let revision: string | undefined;
  export let tree: Tree;
  export let project: Project;

  let selectedBranch: string | undefined;

  // Revision may be a commit ID, a branch name or `undefined` which means the
  // default branch. We assign `selectedBranch` accordingly.
  $: if (revision === commitId) {
    selectedBranch = undefined;
  } else {
    selectedBranch = revision || project.defaultBranch;
  }

  $: commitId = tree.lastCommit.id;
  $: peer = peers.find(p => p.selected)?.remote.id;
</script>

<style>
  .top-header {
    display: flex;
    align-items: center;
    justify-content: left;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .header {
    font-size: var(--font-size-tiny);
    display: flex;
    align-items: center;
    justify-content: left;
    flex-wrap: wrap;
    position: relative;
  }
  .header::after {
    content: "";
    position: absolute;
    left: -1rem;
    bottom: 0;
    border-bottom: 1px solid var(--color-fill-separator);
    width: calc(100% + 1rem);
    z-index: -1;
  }

  .counter {
    border-radius: var(--border-radius-tiny);
    background-color: var(--color-fill-ghost);
    color: var(--color-foreground-dim);
    padding: 0 0.25rem;
  }

  .title-counter {
    display: flex;
    gap: 0.5rem;
  }

  .selected {
    background-color: var(--color-fill-ghost);
    color: var(--color-foreground-contrast);
  }
</style>

<div class="top-header">
  {#if peers.length > 0}
    <PeerSelector {peers} />
  {/if}

  <BranchSelector
    {branches}
    {project}
    {node}
    selectedCommitId={commitId}
    {selectedBranch} />
</div>

<div class="header">
  <div style="display: flex; gap: 0.25rem;">
    <Link
      route={{
        resource: "project.source",
        project: project.id,
        node: node,
        peer,
        revision,
      }}>
      <Button
        styleBorderRadius="0"
        variant={filesLinkActive ? "tab-active" : "tab"}>
        <IconSmall name="file" />Files
      </Button>
    </Link>

    <Link
      route={{
        resource: "project.history",
        project: project.id,
        node: node,
        peer,
        revision,
      }}>
      <Button
        styleBorderRadius="0"
        variant={historyLinkActive ? "tab-active" : "tab"}>
        <IconSmall name="commit" />
        <div class="title-counter">
          Commits
          <div class="counter" class:selected={historyLinkActive}>
            {tree.stats.commits}
          </div>
        </div>
      </Button>
    </Link>
  </div>

  <HoverPopover stylePopoverPositionLeft="0" stylePopoverPositionTop="0.5rem">
    <Button disabled notAllowed={false} variant="tab" slot="toggle">
      <IconSmall name="user" />
      <div class="title-counter">
        Contributors
        <div class="counter">{tree.stats.contributors}</div>
      </div>
    </Button>
    <div class="txt-small" slot="popover">
      <div style:margin-bottom="1rem">Coming soon.</div>
      <div>Listing contributors is not implemented yet.</div>
    </div>
  </HoverPopover>
</div>
