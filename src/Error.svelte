<script lang="ts">
  import type { Err } from "@app/error";

  import Button from "@app/Button.svelte";
  import Modal from "@app/Modal.svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let floating = false;
  export let action = floating ? "Close" : "Back";
  export let emoji = "";
  export let error: Err | null = null;
  export let message = "";
  export let subtitle = "";
  export let subtle = false;
  export let title = "Error";

  const body = message || (error && error.message) || "";
</script>

<Modal on:close error {floating} {subtle}>
  <span slot="title">
    {#if emoji}
      <div>{emoji}</div>
    {/if}
    {title}
  </span>

  <span slot="subtitle">
    {subtitle}
  </span>

  <span slot="body">
    <slot>
      <span class="txt-bold">Error:</span>
      {body}
    </slot>
  </span>

  <span slot="actions">
    <slot name="actions">
      <Button variant="negative" on:click={() => dispatch("close")}>
        {action}
      </Button>
    </slot>
  </span>
</Modal>
