<script lang="typescript">
  import { createEventDispatcher } from 'svelte';

  export let floating = false;
  export let error: Error | null = null;
  export let subtle = false;

  let dispatch = createEventDispatcher();

  const onClose = () => {
    dispatch('close');
  };
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
</style>

{#if floating}
  <div class="modal-overlay"></div>
{/if}

<div class:modal-floating={floating}>
  <div class="modal" class:error class:modal-subtle={subtle}>
    <div class="modal-title">
      {#if error}
        Error
      {:else}
        <slot name="title"></slot>
      {/if}
    </div>
    <div class="modal-subtitle">
      {#if !error}
        <slot name="subtitle"></slot>
      {/if}
    </div>
    <div class="modal-body">
      {#if error}
        {#if error === Object(error) && error.message}
          <strong>Error:</strong> {error.message}
        {:else}
          {error}
        {/if}
      {:else}
        <slot name="body"></slot>
      {/if}
    </div>
    <div class="modal-actions">
      {#if error}
        <button on:click={onClose}>
          Dismiss
        </button>
      {:else}
        <slot name="actions"></slot>
      {/if}
    </div>
  </div>
</div>
