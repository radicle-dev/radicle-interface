<script lang="ts">
  import * as proj from "@app/project";
  import { formatCommit } from "@app/utils";
  import type { Commit } from "@app/commit";
  import Badge from "@app/Badge.svelte";

  import Changeset from "@app/base/projects/SourceBrowser/Changeset.svelte";
  import CommitAuthorship from "@app/base/projects/Commit/CommitAuthorship.svelte";

  export let project: proj.Project;
  export let commit: Commit;

  const onBrowse = (event: { detail: string }) => {
    project.navigateTo({
      content: proj.ProjectContent.Tree,
      revision: commit.header.sha1,
      path: event.detail
    });
  };
</script>

<style>
  .commit {
    padding: 0 2rem 0 8rem;
  }
  header {
    padding: 1rem;
    background: var(--color-foreground-background-subtle);
    border-radius: var(--border-radius);
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
    color: var(--color-foreground-80);
    font-size: 0.875rem;
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
      <div class="text-medium">{commit.header.summary}</div>
      <div class="desktop font-mono sha1">
        <span>{commit.header.sha1}</span>
      </div>
      <div class="mobile font-mono sha1 text-small">
        {formatCommit(commit.header.sha1)}
      </div>
    </div>
    <pre class="description text-small">{commit.header.description}</pre>
    <div class="authorship">
      <CommitAuthorship {commit} />
      {#if commit.context?.committer}
        <Badge variant="tertiary">Verified</Badge>
      {/if}
    </div>
  </header>
  <Changeset stats={commit.stats} diff={commit.diff} on:browse={onBrowse} />
</div>
