<script lang="ts">
  import type { BaseUrl, Project, Remote, Tree } from "@httpd-client";
  import { type Route } from "@app/lib/router";

  import { pluralize } from "@app/lib/pluralize";

  import BranchSelector from "./BranchSelector.svelte";
  import PeerSelector from "./PeerSelector.svelte";

  import IconSmall from "@app/components/IconSmall.svelte";
  import Link from "@app/components/Link.svelte";
  import Button from "@app/components/Button.svelte";
  import Radio from "@app/components/Radio.svelte";

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
  .header {
    font-size: var(--font-size-tiny);
    display: flex;
    align-items: center;
    justify-content: left;
    flex-wrap: wrap;
    gap: 1rem;
  }

  @media (max-width: 960px) {
    .header {
      margin-bottom: 1.5rem;
    }
  }
</style>

<div class="header">
  {#if peers.length > 0}
    <PeerSelector {peers} />
  {/if}

  <BranchSelector
    {branches}
    {project}
    {node}
    selectedCommitId={commitId}
    {selectedBranch} />

  <Radio>
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
        variant={filesLinkActive ? "secondary" : "gray"}>
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
        variant={historyLinkActive ? "secondary" : "gray"}>
        <IconSmall name="commit" />
        <div>
          {tree.stats.commits}
          {pluralize("commit", tree.stats.commits)}
        </div>
      </Button>
    </Link>

    <Button styleBorderRadius="0" disabled>
      <IconSmall name="user" />
      <div>
        {tree.stats.contributors}
        {pluralize("contributor", tree.stats.contributors)}
      </div>
    </Button>
  </Radio>
</div>
