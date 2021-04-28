<script lang="typescript">
  export let floating = false;

  let className = floating ? "modal-floating" : "";
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

<div class={className}>
  <div class="modal">
    <div class="modal-title">
      <slot name="title"></slot>
    </div>
    <div class="modal-body">
      <slot name="body"></slot>
    </div>
    <div class="modal-actions">
      <slot name="actions"></slot>
    </div>
  </div>
</div>
