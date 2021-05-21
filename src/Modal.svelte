<script lang="typescript">
  export let floating = false;
  export let error = false;
  export let subtle = false;
</script>

<style>
  .modal-floating, .modal-overlay {
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
    background-color: rgba(0, 0, 0, .75);
  }
  .modal {
    padding: 2rem 3rem;
    border: 1px solid var(--color-secondary);
    background: var(--color-background);
    box-shadow: 8px 8px 64px var(--box-shadow-color);
    min-width: 480px;
    max-width: 760px;
    text-align: center;
  }
  .modal.modal-subtle {
    border: none;
    box-shadow: none;
    background: radial-gradient(
      var(--color-glow) 0%,
      transparent 70%
    );
  }
  .modal.modal-subtle.error {
    background: radial-gradient(
      var(--color-glow-error) 0%,
      transparent 70%
    );
  }
  .modal-title {
    font-size: 1.25rem;
    font-weight: bold;
    line-height: 2.625rem;
    margin-bottom: 1rem;
    text-align: center;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .modal-subtitle {
    color: var(--color-secondary);
  }
  .modal-body {
    overflow-x: hidden;
    text-overflow: ellipsis;
    margin: 3rem 0;
  }
  .modal-actions {
    padding-top: 0.5rem;
    margin-top: 2rem;
    text-align: center;
  }
</style>

{#if floating}
  <div class="modal-overlay"></div>
{/if}

<div class:modal-floating={floating}>
  <div class="modal" class:error class:modal-subtle={subtle}>
    <div class="modal-title">
      <slot name="title"></slot>
    </div>
    <div class="modal-subtitle">
      <slot name="subtitle"></slot>
    </div>
    {#if $$slots.body}
      <div class="modal-body">
        <slot name="body"></slot>
      </div>
    {/if}
    <div class="modal-actions">
      <slot name="actions"></slot>
    </div>
  </div>
</div>
