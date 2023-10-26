<script lang="ts">
  import * as modal from "@app/lib/modal";

  import ColorPaletteModal from "@app/modals/ColorPaletteModal.svelte";
  import HotkeysModal from "@app/modals/HotkeysModal.svelte";

  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      modal.hide();
      return;
    }

    switch (event.key) {
      case "?":
        modal.toggle({ component: HotkeysModal, props: {} });
        break;
      case "d":
        if (import.meta.env.PROD) {
          return;
        }
        modal.toggle({ component: ColorPaletteModal, props: {} });
        break;
    }
  };
</script>

<svelte:window on:keydown={onKeydown} />
