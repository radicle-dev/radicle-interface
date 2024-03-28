<style>
  .header {
    display: flex;
    padding: 1rem;
    flex-direction: column;
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
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
  .description {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: var(--font-size-small);
    margin-top: 2rem;
    word-break: break-word;
  }
</style>

<div class="header">
  <div role="heading" aria-level={2} class="summary">
    <slot name="title" />
  </div>
  <div class="subtitle">
    <slot name="state" />
  </div>
  <slot name="subtitle" />
  <div class="description">
    <slot name="description" />
  </div>
</div>
