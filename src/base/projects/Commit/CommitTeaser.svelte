<script lang="ts">
  import type { CommitHeader } from "@app/project";
  import { formatCommit } from "@app/utils";
  import { formatCommitTime } from "./lib";

  export let commit: CommitHeader;
</script>

<style>
  .hash {
    font-family: var(--font-family-monospace);
    padding: 0 1rem 0 0;
  }
  .author {
    margin-right: 8px
  }
  .commit {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1rem 0 1rem;
    height: 2.5rem;
  }

  @media (max-width: 720px) {
    .commit {
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      padding-top: 0.25rem;
      padding-bottom: 0.25rem;
      height: unset;
    }
    .author, .hash {
      font-size: 12px;
    }
    .summary {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      width: 100%;
    }
  }
</style>

<div class="commit">
  <div class="summary">
    <span class="secondary desktop-inline hash">{formatCommit(commit.sha1)}</span>
    <span>{commit.summary}</span>
  </div>
  <div>
    <span class="bold author">{commit.committer.name}</span>
    <span class="desktop-inline">{formatCommitTime(commit.committerTime)}</span>
  </div>
</div>
