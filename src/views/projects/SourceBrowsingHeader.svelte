<script lang="ts">
  import type { BaseUrl, Remote } from "@httpd-client";
  import type { LoadedSourceBrowsingView } from "@app/views/projects/router";

  import { closeFocused } from "@app/components/Floating.svelte";
  import { pluralize } from "@app/lib/pluralize";

  import BranchSelector from "@app/views/projects/BranchSelector.svelte";
  import PeerSelector from "@app/views/projects/PeerSelector.svelte";
  import Link from "@app/components/Link.svelte";
  import SquareButton from "@app/components/SquareButton.svelte";

  export let baseUrl: BaseUrl;
  export let branches: Record<string, string>;
  export let defaultBranch: string;
  export let peer: string | undefined;
  export let peers: Remote[];
  export let projectId: string;
  export let resource: LoadedSourceBrowsingView["resource"];
  export let revision: string | undefined;

  export let commitCount: number;
  export let contributorCount: number;
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
    <PeerSelector {peers} {peer} on:click={() => closeFocused()} />
  {/if}

  <BranchSelector
    {branches}
    {revision}
    on:click={() => closeFocused()}
    {defaultBranch} />

  <Link
    route={{
      resource: "projects",
      params: {
        id: projectId,
        baseUrl,
        view: {
          resource: "history",
        },
        peer,
        revision,
      },
    }}>
    <SquareButton active={resource === "history" || resource === "commits"}>
      <span class="txt-bold">{commitCount}</span>
      {pluralize("commit", commitCount)}
    </SquareButton>
  </Link>

  <SquareButton hoverable={false}>
    <span class="txt-bold">{contributorCount}</span>
    {pluralize("contributor", contributorCount)}
  </SquareButton>
</div>
