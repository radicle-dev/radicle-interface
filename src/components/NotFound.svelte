<script lang="ts">
  import * as router from "@app/lib/router";
  import { twemoji } from "@app/lib/utils";

  import Button from "@app/components/Button.svelte";
  import Modal from "@app/components/Modal.svelte";

  export let title = "";
  export let subtitle = "";
</script>

<Modal subtle>
  <span slot="title" use:twemoji>🏜️</span>
  <span slot="body">
    <p class="txt-medium txt-highlight">
      <span class="txt-bold">{title}</span>
    </p>
    <p>{subtitle}</p>
  </span>
  <span slot="actions">
    <Button variant="foreground" on:click={router.pop}>Back</Button>
  </span>
</Modal>
