<script lang="ts">
  import type { Config } from "@app/config";
  import type { Blob, Project } from "@app/project";
  import { canonicalize, capitalize } from "@app/utils";
  import { formatObjectId } from "@app/cobs";
  import Comment from "@app/Comment.svelte";
  import type { Issue } from "@app/issue";
  import Authorship from "@app/Authorship.svelte";

  export let issue: Issue;
  export let project: Project;
  export let config: Config;

  // Get an image blob based on a relative path.
  const getImage = async (imagePath: string): Promise<Blob> => {
    const finalPath = canonicalize(imagePath, "/"); // We only use the root path in issues.
    const commit = project.branches[project.defaultBranch]; // We suppose that all issues are only looked at on HEAD of the default branch.
    return project.getBlob(commit, finalPath, { highlight: false });
  };
</script>

<style>
  .issue {
    padding: 0 2rem 0 8rem;
  }
  header {
    padding: 1rem;
    background: var(--color-foreground-background-subtle);
    border-radius: var(--border-radius);
    margin-bottom: 2rem;
  }
  main {
    display: flex;
  }

  .comments {
    flex: 1;
  }
  .metadata {
    flex-basis: 18rem;
    margin-left: 1rem;
    border-radius: var(--border-radius);
    font-size: 0.875rem;
    padding-left: 1rem;
  }
  .metadata-section {
    margin-bottom: 1rem;
    border-bottom: 1px dashed var(--color-foreground-subtle);
  }
  .metadata-section-header {
    font-size: 0.875rem;
    margin-bottom: 0.75rem;
    color: var(--color-foreground-faded);
  }
  .metadata-section-body {
    margin-bottom: 1.25rem;
  }
  .metadata-section-empty {
    color: var(--color-foreground-90);
  }
  .label {
    border-radius: var(--border-radius);
    color: var(--color-tertiary);
    background-color: var(--color-tertiary-background);
    padding: 0.25rem 0.75rem;
    margin-right: 0.5rem;
    font-size: 0.875rem;
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
    font-size: 0.75rem;
    margin-left: 0.75rem;
    color: var(--color-foreground-faded);
  }
  .summary-state {
    padding: 0.5rem 1rem;
    border-radius: var(--border-radius);
  }
  .open {
    color: var(--color-positive);
    background-color: var(--color-positive-background);
  }
  .closed {
    background-color: var(--color-negative-2);
  }
  .replies {
    margin-left: 2rem;
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
        <span class="summary-title text-medium">
          {issue.title}
        </span>
        <span class="font-mono id desktop">{issue.id}</span>
        <span class="font-mono id mobile">{formatObjectId(issue.id)}</span>
      </div>
      <div
        class="summary-state"
        class:closed={issue.state.status === "closed"}
        class:open={issue.state.status === "open"}
      >
        {capitalize(issue.state.status)}
      </div>
    </div>
    <Authorship {config}
      author={issue.author} timestamp={issue.timestamp} caption="opened on" />
  </header>
  <main>
    <div class="comments">
      <Comment comment={issue.comment} {getImage} {config} />
      {#each issue.discussion as comment}
        <Comment {comment} {getImage} {config} />
        {#if comment.replies}
          <div class="replies">
            {#each comment.replies as reply}
              <Comment comment={reply} {getImage} {config} />
            {/each}
          </div>
        {/if}
      {/each}
    </div>
    <div class="metadata desktop">
      <div class="metadata-section">
        <div class="metadata-section-header">
          Labels
        </div>
        <div class="metadata-section-body">
          {#if issue.labels?.length}
            {#each issue.labels as label}
              <span class="label">{label}</span>
            {/each}
          {:else}
            <div class="metadata-section-empty">
              No labels.
            </div>
          {/if}
        </div>
      </div>
    </div>
  </main>
</div>
