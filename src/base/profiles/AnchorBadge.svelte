<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let anchors: Array<string> = [];
  export let head: string;
  export let commit: string;
  export let noText = false;
  export let noBg = false;

  const text = !noText;
</script>

<style>
  .anchor-widget {
    display: flex;
    padding: 0.5rem 0.75rem;
    border-radius: inherit;
    color: var(--color-tertiary);
    background-color: var(--color-tertiary-background);
    cursor: pointer;
  }
  .anchor-widget.not-allowed {
    cursor: not-allowed;
  }
  .anchor-widget.not-anchored {
    color: var(--color-foreground-faded);
    background-color: var(--color-foreground-background);
  }
  .anchor-widget.no-bg {
    background: none !important;
    padding: 0 !important;
  }
  .anchor-label {
    font-family: var(--font-family-monospace);
    margin-right: 0.5rem;
  }
  .anchor-label:last-child {
    margin-right: 0;
  }
  .anchor-latest {
    cursor: default;
  }
</style>

{#if anchors}
  <!-- commit is head and latest anchor  -->
  {#if commit == anchors[0] && commit === head}
    <span class="anchor-widget anchor-latest" class:no-bg={noBg}>
      <span class="anchor-label" title="{anchors[0]}">{#if text}latest&nbsp;{/if}🔐</span>
    </span>
  <!-- commit is not head but latest anchor  -->
  {:else if commit == anchors[0] && commit !== head}
    <span class="anchor-widget" class:no-bg={noBg} on:click={() => dispatch("click", head)}>
      <span class="anchor-label" title="{anchors[0]}">{#if text}latest&nbsp;{/if}🔐</span>
    </span>
  <!-- commit is not head a stale anchor  -->
  {:else if anchors.includes(commit)}
    <span class="anchor-widget" class:no-bg={noBg} on:click={() => dispatch("click", anchors[0])}>
      <span class="anchor-label" title="{commit}">{#if text}stale&nbsp;{/if}🔒</span>
    </span>
  <!-- commit is not anchored, could be head or any other commit  -->
  {:else}
    <span class="anchor-widget not-anchored" class:no-bg={noBg} on:click={() => dispatch("click", anchors[0])}>
      <span class="anchor-label">{#if text}not anchored&nbsp;{/if}🔓</span>
    </span>
  {/if}
{:else}
  <!-- commit is not head and neither an anchor, and there are no anchors available  -->
  <span class="anchor-widget not-anchored not-allowed" class:no-bg={noBg}>
    <span class="anchor-label">{#if text}not anchored&nbsp;{/if}🔓</span>
  </span>
{/if}
