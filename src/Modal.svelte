<script lang="ts">
  export let floating = false;
  export let error = false;
  export let subtle = false;
  export let small = false;
  export let narrow = false;
  export let center = false;
</script>

<style>
  .floating,
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  .floating {
    z-index: 300;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .overlay {
    z-index: 200;
    background-color: #00000075;
  }
  .modal {
    padding: 2rem 3rem;
    border: 1px solid var(--color-secondary);
    font-family: var(--font-family-sans-serif);
    background: var(--color-background);
    box-shadow: var(--elevation-high);
    min-width: 480px;
    max-width: 760px;
    text-align: center;
  }
  .narrow {
    max-width: 600px;
  }
  .subtle {
    border: none;
    box-shadow: none;
    background: radial-gradient(var(--glow) 0%, transparent 70%);
  }
  .subtle.error {
    background: radial-gradient(var(--glow-error) 0%, transparent 70%);
  }
  .title {
    color: var(--color-foreground);
    font-size: var(--font-size-medium);
    font-weight: var(--font-weight-bold);
    line-height: 2.625rem;
    margin-bottom: 0.5rem;
    text-align: center;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .subtitle {
    color: var(--color-secondary);
    font-size: var(--font-size-regular);
    max-width: 90%;
    margin: 0 auto;
    line-height: 1.5;
  }
  .body {
    color: var(--color-foreground);
    font-size: var(--font-size-regular);
    overflow-x: hidden;
    text-overflow: ellipsis;
    margin: 3rem 0;
  }
  .actions {
    padding-top: 0.5rem;
    margin-top: 2rem;
    text-align: center;
  }
  .small .subtitle {
    color: var(--color-foreground);
  }
  .error {
    box-shadow: var(--elevation-high-negative);
    border-color: var(--color-negative);
  }

  .error > * {
    color: var(--color-negative);
  }

  @media (max-width: 720px) {
    .modal {
      width: 90%;
      min-width: unset;
    }
  }
</style>

{#if floating}
  <div class="overlay" />
{/if}

<div class:floating class:off-centered={!center}>
  <div class="modal" class:subtle class:narrow class:small class:error>
    <div class="title">
      <slot name="title" />
    </div>
    <div class="subtitle">
      <slot name="subtitle" />
    </div>
    {#if $$slots.body && !small}
      <div class="body">
        <slot name="body" />
      </div>
    {/if}
    <div class="actions">
      <slot name="actions" />
    </div>
  </div>
</div>
