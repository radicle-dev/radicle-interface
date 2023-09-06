<script lang="ts">
  import * as modal from "@app/lib/modal";

  import ColorPaletteModal from "@app/modals/ColorPaletteModal.svelte";
  import HotkeysModal from "@app/modals/HotkeysModal.svelte";
  import { searchPlaceholder } from "@app/lib/shared";

  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      modal.hide();
      return;
    }

    switch (event.key) {
      case "?":
        modal.toggle({ component: HotkeysModal, props: {} });
        break;
      case "/": {
        event.preventDefault();
        const searchInput: HTMLElement | null = document.querySelector(
          `*[placeholder="${searchPlaceholder}"]`,
        );
        searchInput?.focus();
        break;
      }
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
