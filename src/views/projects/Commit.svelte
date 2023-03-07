<script lang="ts">
  import type { Commit } from "@app/lib/commit";

  import { formatCommit, twemoji } from "@app/lib/utils";

  import Changeset from "@app/views/projects/SourceBrowser/Changeset.svelte";
  import CommitAuthorship from "@app/views/projects/Commit/CommitAuthorship.svelte";
  import * as router from "@app/lib/router";

  export let commit: Commit;

  const { commit: header } = commit;
  const onBrowse = (event: { detail: string }) => {
    router.updateProjectRoute({
      view: { resource: "tree" },
      path: event.detail,
    });
  };
</script>

<style>
  .commit {
    padding: 0 2rem 0 8rem;
  }
  header {
    padding: 1rem;
    background: var(--color-background-1);
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

  @media (max-width: 960px) {
    .commit {
      padding-left: 2rem;
    }
  }
</style>

<div class="commit">
  <header>
    <div class="summary">
      <div class="txt-medium" use:twemoji>{header.summary}</div>
      <div class="layout-desktop txt-monospace sha1">
        <span>{header.id}</span>
      </div>
      <div class="layout-mobile txt-monospace sha1 txt-small">
        {formatCommit(header.id)}
      </div>
    </div>
    <pre class="description txt-small">{header.description}</pre>
    <CommitAuthorship {header} />
  </header>
  <Changeset
    stats={commit.diff.stats}
    diff={commit.diff}
    on:browse={onBrowse} />
</div>
