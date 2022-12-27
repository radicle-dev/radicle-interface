<script lang="ts">
  import type { Wallet } from "@app/lib/wallet";
  import type { Blob, Project } from "@app/lib/project";
  import { canonicalize, capitalize } from "@app/lib/utils";
  import { formatObjectId } from "@app/lib/cobs";
  import Comment from "@app/components/Comment.svelte";
  import type { Issue } from "@app/lib/issue";
  import Authorship from "@app/components/Authorship.svelte";

  export let issue: Issue;
  export let project: Project;
  export let wallet: Wallet;

  // Get an image blob based on a relative path.
  const getImage = async (imagePath: string): Promise<Blob> => {
    const finalPath = canonicalize(imagePath, "/"); // We only use the root path in issues.
    const commit = project.branches[project.defaultBranch]; // We suppose that all issues are only looked at on HEAD of the default branch.
    return project.getBlob(commit, finalPath);
  };
</script>

<style>
  header {
    padding: 1rem;
    background: var(--color-foreground-1);
    border-radius: var(--border-radius);
    margin-bottom: 2rem;
  }
  main {
    display: flex;
  }
  .issue {
    padding: 0 2rem 0 8rem;
  }
  .comments {
    flex: 1;
  }
  .metadata {
    flex-basis: 18rem;
    margin-left: 1rem;
    border-radius: var(--border-radius);
    font-size: var(--font-size-small);
    padding-left: 1rem;
  }
  .metadata-section {
    margin-bottom: 1rem;
    border-bottom: 1px dashed var(--color-foreground-4);
  }
  .metadata-section-header {
    font-size: var(--font-size-small);
    margin-bottom: 0.75rem;
    color: var(--color-foreground-5);
  }
  .metadata-section-body {
    margin-bottom: 1.25rem;
  }
  .metadata-section-empty {
    color: var(--color-foreground-6);
  }
  .label {
    border-radius: var(--border-radius);
    color: var(--color-tertiary);
    background-color: var(--color-tertiary-2);
    padding: 0.25rem 0.75rem;
    margin-right: 0.5rem;
    font-size: var(--font-size-small);
    line-height: 1.6;
  }

  .summary {
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  .summary-left {
    display: flex;
    align-items: center;
  }
  .summary-title {
    display: flex;
  }
  .id {
    font-size: var(--font-size-tiny);
    margin-left: 0.75rem;
    color: var(--color-foreground-5);
  }
  .summary-state {
    padding: 0.5rem 1rem;
    border-radius: var(--border-radius);
  }
  .open {
    color: var(--color-positive);
    background-color: var(--color-positive-2);
  }
  .closed {
    color: var(--color-negative);
    background-color: var(--color-negative-2);
  }

  @media (max-width: 960px) {
    .issue {
      padding-left: 2rem;
    }
  }
</style>

<div class="issue">
  <header>
    <div class="summary">
      <div class="summary-left">
        <span class="summary-title txt-medium">
          {issue.title}
        </span>
        <span class="txt-monospace id layout-desktop">{issue.id}</span>
        <span class="txt-monospace id layout-mobile">
          {formatObjectId(issue.id)}
        </span>
      </div>
      <div
        class="summary-state"
        class:closed={issue.state.status === "closed"}
        class:open={issue.state.status === "open"}>
        {capitalize(issue.state.status)}
      </div>
    </div>
    <Authorship
      {wallet}
      author={issue.author}
      timestamp={issue.timestamp}
      caption="opened on" />
  </header>
  <main>
    <div class="comments">
      {#each issue.discussion as comment}
        <Comment {comment} {getImage} {wallet} />
      {/each}
    </div>
    <div class="metadata layout-desktop">
      <div class="metadata-section">
        <div class="metadata-section-header">Tags</div>
        <div class="metadata-section-body">
          {#if issue.tags?.length}
            {#each issue.tags as tag}
              <span class="label">{tag}</span>
            {/each}
          {:else}
            <div class="metadata-section-empty">No tags.</div>
          {/if}
        </div>
      </div>
    </div>
  </main>
</div>
