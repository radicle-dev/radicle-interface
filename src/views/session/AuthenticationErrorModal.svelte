<script lang="ts">
  import FullscreenModal from "@app/components/FullscreenModal.svelte";

  export let title: string;
  export let subtitle: string[];
</script>

<FullscreenModal {title} emoji="🚨">
  <div slot="subtitle">
    {@html subtitle.join("<br />")}
  </div>
</FullscreenModal>
