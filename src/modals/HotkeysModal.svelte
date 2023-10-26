<script lang="ts">
  import Modal from "@app/components/Modal.svelte";
  import Icon from "@app/components/Icon.svelte";
  import KeyHint from "@app/components/KeyHint.svelte";
</script>

<style>
  .hotkeys {
    gap: 3rem;
    justify-content: center;
    display: flex;
    font-size: var(--font-size-small);
  }

  .description {
    text-align: left;
  }

  .pair {
    display: flex;
    width: 8rem;
    justify-content: space-between;
  }

  .group {
    display: flex;
    gap: 1rem;
    flex-direction: column;
  }
</style>

<Modal title="Keyboard shortcuts">
  <Icon name="keyboard" size="48" slot="icon" />

  <div slot="body">
    <div class="hotkeys">
      <div class="group">
        <div class="pair">
          <div class="description">Shortcuts</div>
          <KeyHint>?</KeyHint>
        </div>

        {#if import.meta.env.DEV}
          <div class="pair">
            <div class="description">Color palette</div>
            <KeyHint>d</KeyHint>
          </div>
        {/if}
      </div>

      <div class="group">
        <div class="pair">
          <div class="description">Submit</div>
          <KeyHint>⏎</KeyHint>
        </div>

        <div class="pair">
          <div class="description">Close</div>
          <KeyHint>esc</KeyHint>
        </div>
      </div>
    </div>
  </div>
</Modal>
