<script lang="ts">
  export let center = false;
  export let error = false;
  export let floating = false;
  export let narrow = false;
  export let small = false;
  export let subtle = false;
</script>

<style>
  .modal-floating,
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  .modal-floating {
    z-index: 300;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .modal-overlay {
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
  .modal.error {
    box-shadow: var(--elevation-high-negative);
  }
  .modal.error .modal-title,
  .modal.error .modal-subtitle,
  .modal.error .modal-body,
  .modal.error .modal-actions {
    color: var(--color-negative);
  }
  .modal.modal-narrow {
    max-width: 600px;
  }
  .modal.modal-subtle {
    border: none;
    box-shadow: none;
    background: radial-gradient(var(--glow) 0%, transparent 70%);
  }
  .modal.modal-subtle.error {
    background: radial-gradient(var(--glow-error) 0%, transparent 70%);
  }
  .modal-title {
    color: var(--color-foreground);
    font-size: var(--font-size-medium);
    font-weight: var(--font-weight-bold);
    line-height: 2.625rem;
    margin-bottom: 0.5rem;
    text-align: center;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .modal-subtitle {
    color: var(--color-secondary);
    font-size: var(--font-size-regular);
    max-width: 90%;
    margin: 0 auto;
    line-height: 1.5;
  }
  .modal-body {
    color: var(--color-foreground);
    font-size: var(--font-size-regular);
    overflow-x: hidden;
    text-overflow: ellipsis;
    margin: 3rem 0;
  }
  .modal-actions {
    padding-top: 0.5rem;
    margin-top: 2rem;
    text-align: center;
  }
  .modal-small .modal-subtitle {
    color: var(--color-foreground);
  }
  @media (max-width: 720px) {
    .modal {
      width: 90%;
      min-width: unset;
    }
  }
</style>

{#if floating}
  <div class="modal-overlay" />
{/if}

<div class:modal-floating={floating} class:off-centered={!center}>
  <div
    class="modal"
    class:error
    class:modal-subtle={subtle}
    class:modal-narrow={narrow}
    class:modal-small={small}>
    <div class="modal-title">
      <slot name="title" />
    </div>
    <div class="modal-subtitle">
      <slot name="subtitle" />
    </div>
    {#if $$slots.body && !small}
      <div class="modal-body">
        <slot name="body" />
      </div>
    {/if}
    <div class="modal-actions">
      <slot name="actions" />
    </div>
  </div>
</div>
