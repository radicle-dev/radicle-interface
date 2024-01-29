<script lang="ts">
  import TransitionedHeight from "@app/components/TransitionedHeight.svelte";

  export let title: string;
  export let subtitle: string;

  export let empty: boolean = false;
</script>

<style>
  .section-header {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .title > * {
    margin: 0;
  }

  .title > p {
    margin-top: 0.25rem;
    color: var(--color-foreground-dim);
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    margin-left: auto;
  }

  .empty-container {
    background-color: var(--color-background-float);
    border-radius: var(--border-radius-small);
    border: 1px solid var(--color-border-hint);
    display: flex;
    justify-content: center;
    padding: 3rem 1rem;
    align-items: center;
    opacity: 0.75;
  }

  .empty-container > .inner {
    max-width: 32rem;
    min-height: 12rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
</style>

<section>
  <div class="section-header">
    <div class="title">
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
    <div class="actions">
      <slot name="actions" />
    </div>
  </div>

  <TransitionedHeight transitionHeightChanges>
    {#if empty}
      <div class="empty-container">
        <div class="inner">
          <slot name="empty" />
        </div>
      </div>
    {:else}
      <div>
        <slot />
      </div>
    {/if}
  </TransitionedHeight>
</section>
