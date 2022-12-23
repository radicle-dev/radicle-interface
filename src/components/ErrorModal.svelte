<script lang="ts">
  import type {
    CloseAction,
    PrimaryAction,
  } from "@app/components/Modal.svelte";

  import debounce from "lodash/debounce";
  import Modal from "@app/components/Modal.svelte";
  import Icon from "@app/components/Icon.svelte";

  import { toClipboard } from "@app/lib/utils";

  export let title: string;
  export let caption: string = "There was an error with your transaction.";
  export let error: string | undefined = undefined;

  export let closeAction: CloseAction = undefined;
  export let primaryAction: PrimaryAction = undefined;

  const emoji = "🚨";
  let clipboardIcon: "clipboard" | "checkmark" = "clipboard";

  const resetIcon = debounce(() => {
    clipboardIcon = "clipboard";
  }, 800);

  function copy() {
    if (error) {
      toClipboard(error);
    }
    clipboardIcon = "checkmark";
    resetIcon();
  }
</script>

<style>
  .container {
    overflow: hidden;
    border-radius: var(--border-radius);
    position: relative;
  }

  .copy {
    position: absolute;
    right: 10px;
    top: 10px;
    padding: 2px;
    background-color: var(--color-foreground-2);
    border-radius: var(--border-radius-round);
    cursor: pointer;
  }

  .message {
    font-size: var(--font-size-tiny);
    word-wrap: break-word;
    max-height: 8rem;
    background-color: var(--color-foreground-2);
    overflow-y: auto;
    padding: 1rem;
    text-align: left;
  }
</style>

{#if error}
  <Modal {title} {emoji} {closeAction} {primaryAction}>
    <div slot="subtitle">{caption}</div>
    <div slot="body">
      <div class="container">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="copy" on:click={copy}>
          <Icon name={clipboardIcon} />
        </div>
        <div class="message txt-monospace txt-small">
          {error}
        </div>
      </div>
    </div>
  </Modal>
{:else}
  <Modal {title} {emoji} {closeAction} {primaryAction}>
    <div slot="subtitle">{caption}</div>
  </Modal>
{/if}
