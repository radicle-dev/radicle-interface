<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Icon from "@app/Icon.svelte";
  import { lineNumberL, lineNumberR, lineSign } from "@app/diff";
  import type { FileDiff } from "@app/diff";

  const dispatch = createEventDispatcher();

  export let file: FileDiff;

  function collapse() {
    collapsed = !collapsed;
  }

  let collapsed = false;
</script>

<style>
  .changeset-file {
    border: 1px solid var(--color-foreground-3);
    border-radius: 0.5rem;
    min-width: var(--content-min-width);
    margin-bottom: 2rem;
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
    border-top: 1px solid var(--color-foreground-3);
  }
  .changeset-file main {
    overflow-x: auto;
  }
  header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  header div.actions {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .binary {
    padding: 1rem;
    color: var(--color-foreground-level-4);
    text-align: center;
    background-color: var(--color-foreground-1);
  }
  table.diff {
    font-family: var(--font-family-monospace);
    table-layout: fixed;
    border-collapse: collapse;
    margin: 0.5rem 0;
  }
  tr.diff-line[data-type="+"] > * {
    background: var(--color-positive-1);
  }
  tr.diff-line[data-type="-"] > * {
    background: var(--color-negative-1);
  }
  td.diff-line-number {
    text-align: right;
    user-select: none;
    line-height: 150%;
  }
  td.diff-line-number[data-type="+"],
  td.diff-line-type[data-type="+"] {
    color: var(--color-positive-6);
  }
  td.diff-line-number[data-type="-"],
  td.diff-line-type[data-type="-"] {
    color: var(--color-negative-6);
  }
  td.diff-line-number.left {
    padding: 0 0.25rem 0 1rem;
  }
  td.diff-line-number.right {
    padding: 0 1rem 0 0.25rem;
  }
  td.diff-line-content {
    white-space: pre;
    width: 100%;
    padding-right: 0.5rem;
  }
  td.diff-line-type {
    padding-right: 1rem;
    text-align: center;
  }
  td.diff-expand-header {
    background: var(--color-background);
    color: var(--color-foreground-4);
  }
  td.diff-line-number {
    color: var(--color-foreground-4);
  }
  .file-path {
    margin-left: 0.5rem;
  }
</style>

<article id={file.path} class="changeset-file">
  <header
    on:click={collapse}>
    <div class="actions">
      <Icon name="chevron" width={20} inline fill />
      <p class="bold file-path">{file.path}</p>
    </div>
    <Icon name="browse" width={20} inline fill on:click={() => dispatch("browse", file.path)} />
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
                <td
                  class="diff-line-number left"
                  data-type={lineSign(line)}>
                  {lineNumberL(line)}
                </td>
                <td
                  class="diff-line-number right"
                  data-type={lineSign(line)}>
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
