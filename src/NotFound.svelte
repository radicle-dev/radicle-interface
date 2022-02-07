<script lang="ts">
  import Modal from '@app/Modal.svelte';

  export let title = "";
  export let subtitle = "";

  const back = () => window.history.back();
</script>

<Modal subtle>
  <span slot="title">🏜️</span>
  <span slot="body">
    <p class="highlight"><strong>{title}</strong></p>
    <p>{subtitle}</p>
  </span>
  <span slot="actions">
    <button on:click={back}>
      Back
    </button>
  </span>
</Modal>
