<script lang="ts">
  import type { Commit } from "@app/lib/commit";

  import Changeset from "@app/views/projects/SourceBrowser/Changeset.svelte";
  import CommitAuthorship from "@app/views/projects/Commit/CommitAuthorship.svelte";
  import CommitVerifiedBadge from "@app/views/projects/Commit/CommitVerifiedBadge.svelte";
  import { formatCommit, twemoji } from "@app/lib/utils";

  export let commit: Commit;
</script>

<style>
  .commit {
    padding: 0 2rem 0 8rem;
  }
  header {
    padding: 1rem;
    background: var(--color-foreground-1);
    border-radius: var(--border-radius);
    margin-bottom: 1.5rem;
  }
  .summary {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  .description {
    margin: 0.5rem 0 1rem 0;
  }
  .sha1 {
    color: var(--color-foreground-5);
    font-size: var(--font-size-small);
  }
  .authorship {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  @media (max-width: 960px) {
    .commit {
      padding-left: 2rem;
    }
  }
</style>

<div class="commit">
  <header>
    <div class="summary">
      <div class="txt-medium" use:twemoji>{commit.header.summary}</div>
      <div class="layout-desktop txt-monospace sha1">
        <span>{commit.header.sha1}</span>
      </div>
      <div class="layout-mobile txt-monospace sha1 txt-small">
        {formatCommit(commit.header.sha1)}
      </div>
    </div>
    <pre class="description txt-small">{commit.header.description}</pre>
    <div class="authorship">
      <CommitAuthorship {commit} />
      {#if commit.context?.committer}
        <CommitVerifiedBadge {commit} />
      {/if}
    </div>
  </header>
  <Changeset
    stats={window.HEARTWOOD ? commit.diff.stats : commit.stats}
    diff={commit.diff} />
</div>
