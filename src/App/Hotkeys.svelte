<script lang="ts">
  import * as modal from "@app/lib/modal";

  import ColorPalette from "./ColorPalette.svelte";
  import HelpModal from "./HelpModal.svelte";

  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      modal.hide();
      return;
    }

    switch (event.key) {
      case "?":
        modal.toggle({ component: HelpModal, props: {} });
        break;
      case "/": {
        event.preventDefault();
        const searchInput: HTMLElement | null = document.querySelector(
          '*[placeholder="Search a name or address…"]',
        );
        searchInput?.focus();
        break;
      }
      case "d":
        if (import.meta.env.PROD) {
          return;
        }
        modal.toggle({ component: ColorPalette, props: {} });
        break;
    }
  };
</script>

<svelte:window on:keydown={onKeydown} />
