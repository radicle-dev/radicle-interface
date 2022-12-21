<script lang="ts">
  import type { CommitMetadata } from "@app/lib/commit";

  import debounce from "lodash/debounce";

  import Badge from "@app/components/Badge.svelte";
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
    background-color: var(--color-foreground-1);
    border-radius: var(--border-radius-small);
    box-shadow: var(--elevation-low);
    color: var(--color-foreground);
    font-size: var(--font-size-tiny);
    left: -10rem;
    margin-top: 0.5rem;
    padding: 0.5rem 0;
    position: absolute;
    min-width: 14rem;
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
    border-top: 1px dashed var(--color-foreground-4);
    padding: 0.75rem;
  }
  .peer {
    padding-top: 0.5rem;
    word-break: break-all;
    color: var(--color-foreground-5);
  }
</style>

<!-- svelte-ignore a11y-click-events-have-key-events -->
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
          <CommitAuthorship {commit} noAuthor noTime />
          {#if commit.context.committer}
            <div class="peer">
              {commit.context.committer.peer.id}
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>
