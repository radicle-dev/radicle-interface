<script lang="ts">
  import Modal from "@app/components/Modal.svelte";
  import Icon from "@app/components/Icon.svelte";

  export let title: string;
  export let subtitle: string[];
</script>

<Modal {title} showCloseButton>
  <Icon name="alert" size="48" slot="icon" />

  <div slot="subtitle">
    {@html subtitle.join("<br />")}
  </div>
</Modal>
