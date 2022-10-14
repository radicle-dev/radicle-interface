<script lang="ts">
  import Button from "@app/Button.svelte";
  import Modal from "@app/Modal.svelte";

  export let title = "";
  export let subtitle = "";

  const back = () => window.history.back();
</script>

<Modal subtle>
  <span slot="title">🏜️</span>
  <span slot="body">
    <p class="txt-medium txt-highlight">
      <span class="txt-bold">{title}</span>
    </p>
    <p>{subtitle}</p>
  </span>
  <span slot="actions">
    <Button variant="foreground" on:click={back}>Back</Button>
  </span>
</Modal>
