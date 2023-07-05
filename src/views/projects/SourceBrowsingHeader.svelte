<script lang="ts">
  import type { BaseUrl, Remote } from "@httpd-client";
  import type { LoadedSourceBrowsingView } from "@app/views/projects/router";

  import { pluralize } from "@app/lib/pluralize";

  import BranchSelector from "@app/views/projects/BranchSelector.svelte";
  import PeerSelector from "@app/views/projects/PeerSelector.svelte";
  import Link from "@app/components/Link.svelte";
  import SquareButton from "@app/components/SquareButton.svelte";

  export let baseUrl: BaseUrl;
  export let branches: Record<string, string> | undefined;
  export let commitCount: number;
  export let contributorCount: number;
  export let defaultBranch: string;
  export let peer: string | undefined;
  export let peers: Remote[];
  export let projectId: string;
  export let view: LoadedSourceBrowsingView;
  export let revision: string | undefined;
  export let commitId: string;

  let selectedBranch: string | undefined;

  // Revision may be a commit ID, a branch name or `undefined` which means the
  // default branch. We assign `selectedBranch` accordingly.
  // TODO: Move this logic out of here and have `selectedBranch` be passed as a
  // prop.
  $: if (revision === commitId) {
    selectedBranch = undefined;
  } else {
    selectedBranch = revision ?? defaultBranch;
  }
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
    <PeerSelector {baseUrl} {peers} {peer} {projectId} {view} />
  {/if}

  <BranchSelector
    selectedCommitId={commitId}
    {baseUrl}
    {branches}
    {peer}
    {projectId}
    {selectedBranch}
    {view} />

  <Link
    route={{
      resource: "projects",
      params: {
        id: projectId,
        baseUrl,
        peer,
        revision,
        view: { resource: "history" },
      },
    }}>
    <SquareButton
      active={view.resource === "history" || view.resource === "commits"}>
      <span class="txt-bold">{commitCount}</span>
      {pluralize("commit", commitCount)}
    </SquareButton>
  </Link>

  <SquareButton hoverable={false}>
    <span class="txt-bold">{contributorCount}</span>
    {pluralize("contributor", contributorCount)}
  </SquareButton>
</div>
