<script lang="ts">
  import type { Embed } from "@http-client";

  import ExtendedTextarea from "@app/components/ExtendedTextarea.svelte";

  export let body: string | undefined = undefined;
  export let placeholder: string | undefined = undefined;
  export let submitCaption: string | undefined = undefined;
  export let rawPath: string;
  export let enableAttachments: boolean = false;
  export let inline: boolean = false;
  export let focus: boolean = false;
  export let submit: (comment: string, embeds: Embed[]) => Promise<void>;

  let state: "collapsed" | "expanded" | "submit" = "collapsed";
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

{#if state !== "collapsed"}
  <ExtendedTextarea
    {rawPath}
    {inline}
    {placeholder}
    {submitCaption}
    submitInProgress={state === "submit"}
    {focus}
    {body}
    {enableAttachments}
    on:close={() => (state = "collapsed")}
    on:submit={async ({ detail: { comment, embeds } }) => {
      try {
        state = "submit";
        await submit(comment, Array.from(embeds.values()));
      } finally {
        state = "collapsed";
      }
    }} />
{:else}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    class="inactive"
    role="button"
    tabindex="0"
    on:click={() => (state = "expanded")}>
    {placeholder}
  </div>
{/if}
