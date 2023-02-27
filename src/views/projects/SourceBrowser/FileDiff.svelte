<script lang="ts" strictEvents>
  import type {
    DiffAddedDeletedModifiedChangeset,
    HunkLine,
  } from "@httpd-client";

  import { createEventDispatcher } from "svelte";

  import Badge from "@app/components/Badge.svelte";
  import Icon from "@app/components/Icon.svelte";

  const dispatch = createEventDispatcher<{ browse: string }>();

  export let file: DiffAddedDeletedModifiedChangeset;
  export let mode: string | null = null;

  function collapse() {
    collapsed = !collapsed;
  }

  let collapsed = false;

  function lineNumberR(line: HunkLine): string | number {
    switch (line.type) {
      case "addition": {
        return line.lineNo;
      }
      case "context": {
        return line.lineNoNew;
      }
      case "deletion": {
        return " ";
      }
    }
  }

  function lineNumberL(line: HunkLine): string | number {
    switch (line.type) {
      case "addition": {
        return " ";
      }
      case "context": {
        return line.lineNoOld;
      }
      case "deletion": {
        return line.lineNo;
      }
    }
  }

  function lineSign(line: HunkLine): string {
    switch (line.type) {
      case "addition": {
        return "+";
      }
      case "context": {
        return " ";
      }
      case "deletion": {
        return "-";
      }
    }
  }
</script>

<style>
  .changeset-file {
    border: 1px solid var(--color-foreground-4);
    border-radius: var(--border-radius-small);
    margin-bottom: 2rem;
    line-height: 1.5rem;
  }
  .changeset-file header {
    cursor: pointer;
    height: 3rem;
    display: flex;
    align-items: center;
    background: none;
    border-radius: 0;
    padding: 1rem;
  }
  main {
    border-top: 1px dashed var(--color-foreground-4);
    background: var(--color-background-1);
    border-radius: 0 0 var(--border-radius-small) var(--border-radius-small);
  }
  .changeset-file main {
    overflow-x: auto;
  }
  header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  .actions {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1rem;
  }
  .binary {
    padding: 1rem;
    color: var(--color-foreground-5);
    text-align: center;
    background-color: var(--color-foreground-2);
  }
  table.diff {
    font-family: var(--font-family-monospace);
    table-layout: fixed;
    border-collapse: collapse;
    margin: 0.5rem 0;
  }
  tr.diff-line {
    vertical-align: top;
  }
  tr.diff-line[data-type="+"] > * {
    color: var(--color-positive);
  }
  tr.diff-line[data-type="-"] > * {
    color: var(--color-negative);
  }
  td.diff-line-number {
    text-align: right;
    user-select: none;
    line-height: 1.5rem;
    min-width: 3rem;
  }
  td.diff-line-number[data-type="+"],
  td.diff-line-type[data-type="+"] {
    background-color: var(--color-positive-2);
    color: var(--color-positive-6);
  }
  td.diff-line-number[data-type="-"],
  td.diff-line-type[data-type="-"] {
    background-color: var(--color-negative-2);
    color: var(--color-negative-6);
  }
  td.diff-line-number.left {
    padding: 0 0.5rem 0 0.75rem;
  }
  td.diff-line-number.right {
    padding: 0 0.75rem 0 0.5rem;
  }
  td.diff-line-content {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    width: 100%;
    padding-right: 0.5rem;
  }
  td.diff-line-type {
    text-align: center;
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
  td.diff-expand-header {
    padding-left: 0.5rem;
    color: var(--color-foreground-5);
  }
  td.diff-line-number {
    color: var(--color-foreground-5);
  }
  .browse {
    display: flex;
  }
</style>

<article id={file.path} class="changeset-file">
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <header class="file-header" on:click={collapse}>
    <div class="actions">
      <p class="txt-regular">{file.path}</p>
      {#if mode === "added"}
        <Badge variant="positive">added</Badge>
      {:else if mode === "deleted"}
        <Badge variant="negative">deleted</Badge>
      {/if}
    </div>
    <div
      class="browse clickable"
      on:click|stopPropagation={() => dispatch("browse", file.path)}>
      <span title="View file" style="transform: scale(1.25);">
        <Icon name="browse" />
      </span>
    </div>
  </header>
  {#if !collapsed}
    <main>
      {#if file.diff.type === "plain" && file.diff.hunks.length > 0}
        <table class="diff">
          {#each file.diff.hunks as hunk}
            <tr class="diff-line">
              <td colspan={2} />
              <td colspan={6} class="diff-expand-header">
                {hunk.header}
              </td>
            </tr>
            {#each hunk.lines as line}
              <tr class="diff-line" data-expanded data-type={lineSign(line)}>
                <td class="diff-line-number left" data-type={lineSign(line)}>
                  {lineNumberL(line)}
                </td>
                <td class="diff-line-number right" data-type={lineSign(line)}>
                  {lineNumberR(line)}
                </td>
                <td class="diff-line-type" data-type={line.type}>
                  {lineSign(line)}
                </td>
                <td class="diff-line-content">{line.line}</td>
              </tr>
            {/each}
          {/each}
        </table>
      {:else}
        <div class="binary">Binary file</div>
      {/if}
    </main>
  {/if}
</article>
