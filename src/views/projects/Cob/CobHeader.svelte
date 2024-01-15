<style>
  .header {
    display: flex;
    flex-direction: column;
    border-radius: var(--border-radius-small);
  }
  .subtitle {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    font-size: var(--font-size-small);
    font-family: var(--font-family-monospace);
  }
  .summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  .description {
    font-size: var(--font-size-small);
    margin-top: 1rem;
    word-break: break-word;
  }
</style>

<div class="header">
  <div role="heading" aria-level={2} class="summary">
    <slot name="title" />
  </div>
  <div class="subtitle">
    <slot name="state" />
    <slot name="author" />
  </div>
  <div class="description">
    <slot name="description" />
  </div>
</div>
