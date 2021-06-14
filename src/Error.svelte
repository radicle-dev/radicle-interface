<script lang="typescript">
  import { createEventDispatcher } from 'svelte';
  import Modal from '@app/Modal.svelte';
  import type { Err } from '@app/error';

  const dispatch = createEventDispatcher();

  export let error: Err | null = null;
  export let title = "Error";
  export let subtitle = "";
  export let message = "";
  export let floating = false;
  export let subtle = false;

  let body = message || (error && error.message) || "";
</script>

<Modal on:close error {floating} {subtle}>
  <span slot="title">
    {title}
  </span>

  <span slot="subtitle">
    {subtitle}
  </span>

  <span slot="body">
    <slot>
      <strong>Error:</strong> {body}
    </slot>
  </span>

  <span slot="actions">
    <button on:click={() => dispatch('close')}>
      Back
    </button>
  </span>
</Modal>
