<script lang="ts">
  import Modal from "@app/components/Modal.svelte";
  import Icon from "@app/components/Icon.svelte";
</script>

<Modal title="Successfully authenticated" showCloseButton>
  <Icon name="review" size="48" slot="icon" />

  <div slot="subtitle">You're now connected to your local Radicle node.</div>
</Modal>
