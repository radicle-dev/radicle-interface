<script lang="ts">
  import type { Embed } from "@app/lib/file";

  import ExtendedTextarea from "@app/components/ExtendedTextarea.svelte";

  export let body: string | undefined = undefined;
  export let placeholder: string | undefined = undefined;
  export let submitCaption: string | undefined = undefined;
  export let enableAttachments: boolean = false;
  export let inline: boolean = false;
  export let focus: boolean = false;
  export let submit: (comment: string, embeds: Embed[]) => Promise<void>;

  let submitInProgress: boolean = false;
  let active: boolean = false;
</script>

<style>
  .inactive {
    box-shadow: 0 0 0 1px var(--color-border-hint);
    border-radius: var(--border-radius-small);
    padding: 0.5rem 0.75rem;
    background-color: var(--color-background-dip);
    font-size: var(--font-size-small);
    color: var(--color-fill-gray);
    cursor: text;
  }
  .inactive:hover {
    box-shadow: 0 0 0 1px var(--color-border-default);
  }
</style>

{#if active}
  <ExtendedTextarea
    {inline}
    {placeholder}
    {submitCaption}
    {submitInProgress}
    {focus}
    {body}
    {enableAttachments}
    on:close={() => (active = false)}
    on:submit={async ({ detail: { comment, embeds } }) => {
      try {
        submitInProgress = true;
        await submit(comment, embeds);
      } finally {
        submitInProgress = false;
        active = false;
      }
    }} />
{:else}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    class="inactive"
    role="button"
    tabindex="0"
    on:click={() => (active = true)}>
    {placeholder}
  </div>
{/if}
