<script lang="ts">
  import Modal from "@app/components/Modal.svelte";

  export let title: string;
  export let subtitle: string[];
</script>

<Modal {title} emoji="🚨">
  <div slot="subtitle">
    {@html subtitle.join("<br />")}
  </div>
</Modal>
