<script lang="ts" strictEvents>
  import type { Err } from "@app/lib/error";

  import { createEventDispatcher } from "svelte";

  import Button from "@app/components/Button.svelte";
  import Modal from "@app/components/Modal.svelte";

  import { twemoji } from "@app/lib/utils";

  const dispatch = createEventDispatcher<{ close: never }>();

  export let error: Err | null = null;
  export let title = "Error";
  export let emoji = "";
  export let subtitle = "";
  export let message = "";
  export let floating = false;
  export let subtle = false;
  export let action = floating ? "Close" : "Back";

  const body = message || (error && error.message) || "";
</script>

<Modal on:close error {floating} {subtle}>
  <span slot="title" use:twemoji>
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
