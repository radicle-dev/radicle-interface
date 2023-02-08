<script lang="ts">
  import type { Blob, Project } from "@app/lib/project";
  import type { Issue } from "@app/lib/issue";

  import Authorship from "@app/components/Authorship.svelte";
  import Avatar from "@app/components/Comment/Avatar.svelte";
  import Chip from "@app/components/Chip.svelte";
  import Comment from "@app/components/Comment.svelte";
  import { formatNodeId, canonicalize, capitalize } from "@app/lib/utils";
  import { formatObjectId } from "@app/lib/cobs";

  export let issue: Issue;
  export let project: Project;

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
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    gap: 0.5rem;
    margin-bottom: 1.25rem;
  }
  .metadata-section-empty {
    color: var(--color-foreground-6);
  }

  .summary {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  .summary-title {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .id {
    flex: 1 0 auto;
    font-size: var(--font-size-tiny);
    margin-left: 0.75rem;
    color: var(--color-foreground-5);
  }
  .summary-state {
    margin-left: 2rem;
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
  .replies {
    margin-left: 2rem;
  }
  .assignee {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .tag {
    max-width: 15rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (max-width: 960px) {
    .issue {
      padding-left: 2rem;
    }
    .summary-state {
      margin-left: 0.5rem;
    }
  }
</style>

<div class="issue">
  <header>
    <div class="summary">
      <div class="summary-title txt-medium">
        {issue.title}
      </div>
      <div class="txt-monospace id layout-desktop">{issue.id}</div>
      <div class="txt-monospace id layout-mobile">
        {formatObjectId(issue.id)}
      </div>
      <div
        class="summary-state"
        class:closed={issue.state.status === "closed"}
        class:open={issue.state.status === "open"}>
        {capitalize(issue.state.status)}
      </div>
    </div>
    <Authorship
      author={issue.author}
      timestamp={issue.timestamp}
      caption="opened" />
  </header>
  <main>
    <div class="comments">
      {#if !window.HEARTWOOD}
        <Comment comment={issue.comment} {getImage} />
      {/if}

      {#each issue.discussion as comment}
        <Comment {comment} {getImage} />
        {#if !window.HEARTWOOD}
          {#if comment.replies}
            <div class="replies">
              {#each comment.replies as reply}
                <Comment comment={reply} {getImage} />
              {/each}
            </div>
          {/if}
        {/if}
      {/each}
    </div>
    <div class="metadata layout-desktop">
      <div class="metadata-section">
        <div class="metadata-section-header">Assignees</div>
        <div class="metadata-section-body">
          {#if issue.assignees?.length}
            {#each issue.assignees as assignee, key}
              <Chip {key}>
                <div slot="text" class="assignee">
                  <Avatar inline source={assignee} title={assignee} />
                  <span>{formatNodeId(assignee)}</span>
                </div>
              </Chip>
            {/each}
          {:else}
            <div class="metadata-section-empty">No assignees</div>
          {/if}
        </div>
        <div class="metadata-section-header">Tags</div>
        <div class="metadata-section-body">
          {#if issue.tags?.length}
            {#each issue.tags as tag, key}
              <Chip {key}><span class="tag" slot="text">{tag}</span></Chip>
            {/each}
          {:else}
            <div class="metadata-section-empty">No tags</div>
          {/if}
        </div>
      </div>
    </div>
  </main>
</div>
