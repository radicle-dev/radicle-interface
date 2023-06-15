<script lang="ts">
  import ErrorMessage from "@app/components/ErrorMessage.svelte";
  import Modal from "@app/components/Modal.svelte";

  export let title: string;
  export let subtitle: string[];
  export let error: Error;
</script>

<Modal {title} emoji="🚨">
  <div slot="subtitle">
    {@html subtitle.join("<br />")}
  </div>
  <div slot="body">
    <ErrorMessage message={error.message} stackTrace={error.stack} />
  </div>
</Modal>
