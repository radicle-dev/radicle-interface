<script lang="ts">
  import Loading from "@app/components/Loading.svelte";

  export let title: string;
  export let loading = false;
  export let empty: boolean = false;
</script>

<style>
  .section-header {
    margin-bottom: 1.5rem;
  }
  .title {
    width: 100%;
    display: flex;
    align-items: center;
  }
  .title > * {
    margin: 0;
  }

  .subtitle {
    max-width: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    align-items: center;
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
    max-width: 36rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
</style>

<section>
  <div class="section-header">
    <div class="title">
      <slot name="title">
        <h2>{title}</h2>
      </slot>
      <div class="actions">
        <slot name="actions" />
      </div>
    </div>
    <div class="subtitle">
      <slot name="subtitle" />
    </div>
  </div>

  {#if loading}
    <div class="empty-container">
      <div class="inner">
        <Loading small />
      </div>
    </div>
  {:else if empty}
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
</section>
