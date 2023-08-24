<style>
  .header {
    display: flex;
    height: 3rem;
    align-items: center;
    padding: 0 0.5rem 0 1rem;
    border-width: 1px 1px 0 1px;
    border-color: var(--color-border-hint);
    border-style: solid;
    border-top-left-radius: var(--border-radius-small);
    border-top-right-radius: var(--border-radius-small);
  }

  .right {
    display: flex;
    gap: 0.5rem;
    margin-left: auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .left {
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-small);
    flex-shrink: 0;
    padding-right: 0.5rem;
  }

  .container {
    position: relative;
    display: flex;
    overflow-x: auto;
    border: 1px solid var(--color-border-hint);
    border-top-style: solid;
    border-bottom-left-radius: var(--border-radius-small);
    border-bottom-right-radius: var(--border-radius-small);
    background: var(--color-background-float);
    width: 100%;
    border-bottom-left-radius: var(--border-radius-small);
    border-bottom-right-radius: var(--border-radius-small);
  }

  @media (max-width: 720px) {
    .container {
      border-left: none;
      border-right: none;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
  }
</style>

<div class="header">
  <span class="left">
    <slot name="left-header" />
  </span>
  <div class="right">
    <slot name="right-header" />
  </div>
</div>

<div class="container">
  <slot />
</div>
