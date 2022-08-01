<script lang="ts">
  import type { CommitMetadata } from "@app/commit";
  import Popup from "@app/Popup.svelte";
  import CommitAuthorship from "./CommitAuthorship.svelte";

  export let commit: CommitMetadata;
</script>

<style>
  .badge {
    margin: 0;
  }
  .badge:hover .verified-popup {
    display: block;
  }

  .verified-popup {
    display: none;
    position: absolute;
  }
  .verified-popup-header {
    display: flex;
    padding: 1rem 0.75rem;
  }
  .verified-popup-highlight {
    color: var(--color-tertiary);
  }
  .verified-popup-committer {
    border-top: 1px dashed var(--color-foreground-subtle);
    padding: 0.75rem;
  }
  .verified-popup-checkmark {
    margin-right: 0.5rem;
  }
  .verified-popup-peer {
    padding-top: 0.5rem;
    word-break: break-all;
  }

  @media (max-width: 720px) {
    .badge {
      display: none !important;
    }
  }
</style>

{#if commit.context.committer}
  <span class="badge tertiary">
    Verified
    <div class="verified-popup">
      <Popup>
        <div class="verified-popup-header">
          <div class="verified-popup-checkmark verified-popup-highlight">
            ✔
          </div>
          <div class="verified-popup-body">
            This commit was <span class="verified-popup-highlight">signed</span>
            with the committer's radicle key.</div>
        </div>
        <div class="verified-popup-committer">
          <CommitAuthorship {commit} showAuthor={false} showTime={false} />
          <div class="verified-popup-peer">
            <span class="text-faded">{commit.context.committer?.peer.id}</span>
          </div>
        </div>
      </Popup>
    </div>
  </span>
{/if}
