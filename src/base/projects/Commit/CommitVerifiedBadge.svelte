<script lang="ts">
  import type { CommitMetadata } from "@app/commit";
  import CommitAuthorship from "./CommitAuthorship.svelte";
  import Badge from "@app/Badge.svelte";

  export let commit: CommitMetadata;

  let hover = false;
</script>

<style>
  .wrapper {
    position: absolute;
  }
  .popup {
    width: 14rem;
    left: -1rem;
    z-index: 99;
    color: var(--color-foreground);
    font-size: 0.75rem;
  }
  .header {
    display: flex;
    padding: 1rem 0.75rem;
    gap: 0.5rem;
  }
  .highlight {
    color: var(--color-tertiary);
  }
  .committer {
    border-top: 1px dashed var(--color-foreground-subtle);
    padding: 0.75rem;
  }
  .peer {
    padding-top: 0.5rem;
    word-break: break-all;
  }
</style>

<Badge
  variant="tertiary"
  on:mouseenter={() => {hover = true;}}
  on:mouseleave={() => {hover = false;}}>
  Verified
</Badge>

{#if hover}
  <div class="wrapper">
    <div class="popup">
      <div class="header">
        <div class="highlight">✔</div>
        <div>
          This commit was <span class="highlight">signed</span>
          with the committer's radicle key.
        </div>
      </div>
      <div class="committer">
        <CommitAuthorship {commit} showAuthor={false} showTime={false} />
        {#if commit.context.committer}
          <div class="peer">
            <span class="text-faded">{commit.context.committer.peer.id}</span>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
