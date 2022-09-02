<script lang="ts">
  import type { CommitMetadata } from "@app/commit";

  import debounce from "lodash/debounce";

  import Badge from "@app/Badge.svelte";
  import CommitAuthorship from "./CommitAuthorship.svelte";

  export let commit: CommitMetadata;

  let visible = false;
  const showDelay = 50; // ms

  const setVisible = debounce((value: boolean) => {
    visible = value;
  }, showDelay);
</script>

<style>
  .container {
    cursor: default;
  }
  .wrapper {
    position: absolute;
  }
  .popup {
    background-color: var(--color-foreground-background);
    border-radius: var(--border-radius-small);
    box-shadow: 16px 16px 32px 32px var(--color-shadow);
    color: var(--color-foreground);
    font-size: 0.75rem;
    left: -10rem;
    margin-top: 0.5rem;
    padding: 0.5rem 0;
    position: absolute;
    width: 14rem;
    z-index: 99;
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

<div
  class="container"
  on:click|stopPropagation
  on:mouseenter={() => setVisible(true)}
  on:mouseleave={() => setVisible(false)}>
  <Badge variant="tertiary">Verified</Badge>

  {#if visible}
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
</div>
