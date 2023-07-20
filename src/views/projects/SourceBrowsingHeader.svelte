<script lang="ts">
  import type { BaseUrl, Project, Remote, Tree } from "@httpd-client";
  import { type Route } from "@app/lib/router";

  import { pluralize } from "@app/lib/pluralize";

  import BranchSelector from "@app/views/projects/BranchSelector.svelte";
  import PeerSelector from "@app/views/projects/PeerSelector.svelte";
  import Link from "@app/components/Link.svelte";
  import SquareButton from "@app/components/SquareButton.svelte";

  export let seed: BaseUrl;
  export let branches: Array<{ name: string; route: Route }>;
  export let peers: Array<{ remote: Remote; selected: boolean; route: Route }>;
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
    padding: 0 2rem 0 8rem;
    display: flex;
    align-items: center;
    justify-content: left;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 2rem;
  }

  @media (max-width: 960px) {
    .header {
      padding-left: 2rem;
    }
    .header {
      margin-bottom: 1.5rem;
    }
  }
</style>

<div class="header">
  {#if peers.length > 0}
    <PeerSelector {peers} />
  {/if}

  <BranchSelector {branches} selectedCommitId={commitId} {selectedBranch} />

  <Link
    route={{
      resource: "project.history",
      project: project.id,
      seed: seed,
      peer,
      revision,
    }}>
    <SquareButton active={historyLinkActive}>
      <span class="txt-bold">{tree.stats.commits}</span>
      {pluralize("commit", tree.stats.commits)}
    </SquareButton>
  </Link>

  <SquareButton hoverable={false}>
    <span class="txt-bold">{tree.stats.contributors}</span>
    {pluralize("contributor", tree.stats.contributors)}
  </SquareButton>
</div>
