<script lang="ts">
  import type { Commit } from "@httpd-client";

  import { formatCommit, twemoji } from "@app/lib/utils";

  import * as router from "@app/lib/router";

  import Changeset from "@app/views/projects/SourceBrowser/Changeset.svelte";
  import Clipboard from "@app/components/Clipboard.svelte";
  import CommitAuthorship from "@app/views/projects/Commit/CommitAuthorship.svelte";

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
  .header {
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
    margin: 1rem 0;
    white-space: pre-wrap;
  }
  .sha1 {
    align-items: center;
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
  <div class="header">
    <div class="summary">
      <div class="txt-medium txt-bold" use:twemoji>{header.summary}</div>
      <div class="layout-desktop-flex txt-monospace sha1">
        <span>{header.id}</span>
        <Clipboard small text={header.id} />
      </div>
      <div class="layout-mobile-flex txt-monospace sha1 txt-small">
        {formatCommit(header.id)}
        <Clipboard small text={header.id} />
      </div>
    </div>
    <pre class="description txt-small">{header.description}</pre>
    <CommitAuthorship {header} />
  </div>
  <Changeset diff={commit.diff} revision={commit.commit.id} />
</div>
