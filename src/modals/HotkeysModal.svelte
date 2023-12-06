<script lang="ts">
  import Icon from "@app/components/Icon.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import KeyHint from "@app/components/KeyHint.svelte";
  import Modal from "@app/components/Modal.svelte";
</script>

<style>
  .hotkeys {
    justify-content: center;
    gap: 1rem;
    display: flex;
    flex-direction: column;
    font-size: var(--font-size-regular);
  }

  .pair {
    display: flex;
    width: 24rem;
    justify-content: space-between;
  }
  .keys {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
</style>

<Modal title="Keyboard shortcuts">
  <Icon name="keyboard" size="48" slot="icon" />

  <div slot="body">
    <div class="hotkeys">
      <div class="pair">
        <span>Submit</span>
        <KeyHint>⏎</KeyHint>
      </div>

      <div class="pair">
        <span>Post comment</span>
        <div class="keys">
          <KeyHint>⌘</KeyHint> +
          <KeyHint>⏎</KeyHint>
        </div>
      </div>

      <div class="pair">
        <span>Close</span>
        <KeyHint>ESC</KeyHint>
      </div>

      <div class="pair">
        <span>Select multiple lines</span>
        <div class="keys">
          <KeyHint>Shift</KeyHint>
          +
          <IconSmall name="cursor" />
        </div>
      </div>
    </div>
  </div>
</Modal>
