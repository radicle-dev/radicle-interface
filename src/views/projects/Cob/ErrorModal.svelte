<script lang="ts">
  import ErrorMessage from "@app/components/ErrorMessage.svelte";
  import Modal from "@app/components/Modal.svelte";

  export let title: string;
  export let subtitle: string[];
  // This is more explicit than the standard error type.
  export let error: { message: string; stack?: string };
</script>

<Modal {title} emoji="🚨">
  <div slot="subtitle">
    {@html subtitle.join("<br />")}
  </div>
  <div slot="body">
    <ErrorMessage message={error.message} stackTrace={error.stack} />
  </div>
</Modal>
