<script lang="ts" context="module">
  import type { ComponentProps } from "svelte";

  // When `primaryAction` is passed as a prop, render it.
  // When `primaryAction` is not passed as a prop, don't render anything.
  export type CloseAction =
    | Partial<{
        name: string;
        callback: () => void;
        props?: Partial<ComponentProps<Button>>;
      }>
    | undefined
    | false;

  // When `closeAction` is not passed as a prop, render default close action.
  // When `closeAction={false}`, don't show the close action at all.
  // When `closeAction={{ name: "Done" }}`, override one of the default close
  // action props.
  export type PrimaryAction =
    | {
        name: string;
        callback: () => void;
        props?: Partial<ComponentProps<Button>>;
      }
    | undefined;
</script>

<script lang="ts">
  import twemoji from "twemoji";

  import * as modal from "@app/lib/modal";
  import { base } from "@app/lib/router";

  import Button from "@app/components/Button.svelte";

  export let emoji: string | undefined = undefined;
  export let title: string | undefined = undefined;

  export let primaryAction: PrimaryAction = undefined;
  export let closeAction: CloseAction = undefined;
</script>

<style>
  .modal {
    padding: 2rem 3rem;
    border-radius: var(--border-radius-regular);
    font-family: var(--font-family-sans-serif);
    background: var(--color-background-float);
    box-shadow: var(--elevation-low);
    min-width: 480px;
    max-width: 760px;
    text-align: center;
    border: 1px solid var(--color-border-hint);
  }
  .title {
    color: var(--color-foreground);
    font-size: var(--font-size-medium);
    font-weight: var(--font-weight-bold);
    line-height: 2.625rem;
    margin-bottom: 0.5rem;
    text-align: center;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .subtitle {
    color: var(--color-secondary);
    font-size: var(--font-size-regular);
    max-width: 90%;
    margin: 0 auto;
    line-height: 1.5;
  }
  .body {
    color: var(--color-foreground);
    font-size: var(--font-size-regular);
    overflow-x: hidden;
    text-overflow: ellipsis;
    margin: 3rem 0;
  }
  .actions {
    gap: 1.5rem;
    display: flex;
    justify-content: center;
  }
  @media (max-width: 720px) {
    .modal {
      width: 90%;
      min-width: unset;
    }
  }
</style>

<div class="modal">
  {#if emoji}
    <div style:font-size="var(--font-size-xx-large)">
      {@html twemoji.parse(emoji, {
        base,
        folder: "twemoji",
        ext: ".svg",
        className: "txt-emoji",
      })}
    </div>
  {/if}

  {#if title}
    <div class="title">{title}</div>
  {/if}

  {#if $$slots.subtitle}
    <div class="subtitle">
      <slot name="subtitle" />
    </div>
  {/if}

  {#if $$slots.body}
    <div class="body">
      <slot name="body" />
    </div>
  {/if}

  <div class="actions">
    {#if primaryAction}
      <Button
        style={$$slots.body ? "margin-top: 1rem;" : "margin-top: 3rem;"}
        autofocus
        variant="primary"
        {...primaryAction.props}
        on:click={primaryAction.callback}>
        {primaryAction.name}
      </Button>
    {/if}

    {#if closeAction !== false}
      <Button
        style={$$slots.body ? "margin-top: 1rem;" : "margin-top: 3rem;"}
        variant="foreground"
        {...closeAction?.props}
        on:click={closeAction?.callback ?? modal.hide}>
        {closeAction?.name ?? "Close"}
      </Button>
    {/if}
  </div>
</div>
