<script lang="ts">
  import ErrorMessage from "@app/components/ErrorMessage.svelte";
  import FullscreenModal from "@app/components/FullscreenModal.svelte";

  export let title: string;
  export let subtitle: string[];
  export let error: Error;
</script>

<FullscreenModal {title} emoji="🚨">
  <div slot="subtitle">
    {@html subtitle.join("<br />")}
  </div>
  <div slot="body">
    <ErrorMessage message={error.message} stackTrace={error.stack} />
  </div>
</FullscreenModal>
