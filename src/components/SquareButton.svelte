<script lang="ts" strictEvents>
  export let active: boolean = false;
  export let clickable: boolean = false;
  export let disabled: boolean = false;
  export let hoverable: boolean = true;
  export let size: "small" | "regular" = "regular";
  export let title: string | undefined = undefined;
</script>

<style>
  .square-button {
    display: flex;
    align-items: center;
    height: 2rem;
    padding: 0 0.75rem;
    background: var(--fill-ghost);
    border: none;
    color: var(--color-foreground);
    font-family: var(--font-family-inter);
    font-size: var(--font-size-small);
    font-weight: 600;
    white-space: nowrap;
    gap: 0.5rem;
  }

  .small {
    height: var(--button-tiny-height);
  }

  .clickable {
    cursor: pointer;
    user-select: none;
  }

  .active {
    color: var(--foreground-match-background);
    background: var(--fill-light);
    background-color: var(--fill-light);
  }

  .active:hover {
    background-color: var(--fill-light-hover);
  }

  .hoverable:hover {
    background-color: var(--fill-ghost-hover);
  }

  .active.hoverable:hover {
    background-color: var(--fill-light-hover);
  }

  .disabled {
    cursor: not-allowed;
    color: var(--color-foreground-5);
  }
  .disabled.active {
    color: var(--color-background);
  }
  .disabled:hover {
    background: var(--color-foreground-1);
  }
</style>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  {title}
  role="button"
  tabindex="0"
  on:click
  class="square-button"
  class:active
  class:hoverable
  class:disabled
  class:small={size === "small"}
  class:clickable>
  <slot name="icon" />
  <div style:display="block">
    <slot />
  </div>
</div>
