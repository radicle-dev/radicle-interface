<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type {
    BaseUrl,
    DiffAddedDeletedModifiedChangeset,
    HunkLine,
  } from "@httpd-client";

  import Badge from "@app/components/Badge.svelte";
  import Icon from "@app/components/Icon.svelte";
  import Link from "@app/components/Link.svelte";

  export let file: DiffAddedDeletedModifiedChangeset;
  export let revision: string;
  export let headerBadgeCaption: "added" | "deleted" | undefined = undefined;
  export let baseUrl: BaseUrl;
  export let projectId: string;

  let collapsed = false;
  let selection: Selection | undefined = undefined;

  onMount(() => {
    window.addEventListener("click", deselectHandler);
    window.addEventListener("hashchange", updateSelection);

    updateSelection();

    if (selection) {
      document
        .getElementById(
          [
            file.path,
            "H" + selection.startHunk,
            "L" + selection.startLine,
          ].join("-"),
        )
        ?.scrollIntoView();
    }
  });

  onDestroy(() => {
    window.removeEventListener("click", deselectHandler);
    window.removeEventListener("hashchange", updateSelection);
  });

  function deselectHandler(e: MouseEvent) {
    if (
      !(
        e.target instanceof HTMLElement &&
        e.target.closest("[data-file-diff-select]")
      )
    ) {
      updateHash("");
    }
  }

  function updateSelection() {
    const fragment = window.location.hash.substring(1);
    const match = fragment.match(/(.+):H(\d+)L(\d+)(H(\d+)L(\d+))?/);
    if (match && match[1] === file.path) {
      selection = {
        startHunk: parseInt(match[2]),
        startLine: parseInt(match[3]),
        endHunk: match[4] ? parseInt(match[5]) : undefined,
        endLine: match[4] ? parseInt(match[6]) : undefined,
      };
    } else {
      selection = undefined;
    }
  }

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

  function isLineSelected(
    selection: Selection | undefined,
    hunkIdx: number,
    lineIdx: number,
  ): boolean {
    if (!selection) {
      return false;
    }

    if (selection.endHunk !== undefined && selection.endLine !== undefined) {
      return (
        hunkIdx >= selection.startHunk &&
        hunkIdx <= selection.endHunk &&
        (hunkIdx === selection.startHunk
          ? lineIdx >= selection.startLine
          : true) &&
        (hunkIdx === selection.endHunk ? lineIdx <= selection.endLine : true)
      );
    } else {
      return hunkIdx === selection.startHunk && lineIdx === selection.startLine;
    }
  }

  function hashFromSelection(
    hunkIdx: number,
    lineIdx: number,
    event: MouseEvent,
  ): string {
    const path = file.path;
    // single line selection
    if (!event.shiftKey) {
      return path + ":H" + hunkIdx + "L" + lineIdx;
    }

    if (!selection) {
      return "";
    }

    // range selection
    if (hunkIdx === selection.startHunk) {
      if (lineIdx >= selection.startLine) {
        return `${path}:H${hunkIdx}L${selection.startLine}H${hunkIdx}L${lineIdx}`;
      } else {
        return `${path}:H${hunkIdx}L${lineIdx}H${hunkIdx}L${selection.startLine}`;
      }
    } else if (hunkIdx < selection.startHunk) {
      return `${path}:H${hunkIdx}L${lineIdx}H${selection.startHunk}L${selection.startLine}`;
    } else {
      return `${path}:H${selection.startHunk}L${selection.startLine}H${hunkIdx}L${lineIdx}`;
    }
  }

  function selectLine(hunkIdx: number, lineIdx: number, event: MouseEvent) {
    updateHash(hashFromSelection(hunkIdx, lineIdx, event));
  }

  function updateHash(newHash: string) {
    if (newHash !== "") {
      window.location.hash = newHash;
    } else {
      window.history.replaceState(
        window.history.state,
        "",
        window.location.pathname + window.location.search,
      );
      selection = undefined;
    }
  }

  function hunkHeaderSelected(selection: Selection | undefined, hunk: number) {
    return (
      selection &&
      selection.endHunk !== undefined &&
      hunk > selection.startHunk &&
      hunk <= selection.endHunk
    );
  }

  interface Selection {
    startHunk: number;
    startLine: number;
    endHunk: number | undefined;
    endLine: number | undefined;
  }
</script>

<style>
  .wrapper {
    border: 1px solid var(--color-foreground-4);
    border-radius: var(--border-radius-small);
    margin-bottom: 2rem;
    line-height: 1.5rem;
  }
  .header {
    align-items: center;
    background: none;
    border-radius: 0;
    display: flex;
    flex-direction: row;
    height: 3rem;
    padding: 1rem;
  }
  main {
    font-size: var(--font-size-small);
    border-top: 1px dashed var(--color-foreground-4);
    background-color: var(--color-foreground-1);
    border-radius: 0 0 var(--border-radius-small) var(--border-radius-small);
    overflow-x: auto;
  }
  .actions {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1rem;
  }
  .placeholder {
    padding: 1rem;
    color: var(--color-foreground-5);
    text-align: center;
  }
  .browse {
    margin-left: auto;
    cursor: pointer;
  }
  .expand-button {
    cursor: pointer;
    user-select: none;
    margin-right: 0.5rem;
  }
  .diff {
    font-family: var(--font-family-monospace);
    table-layout: fixed;
    border-collapse: collapse;
    margin: 0.5rem 0;
  }
  .diff-line {
    vertical-align: top;
  }
  .diff-line.type-addition > * {
    color: var(--color-positive-6);
    background-color: var(--color-positive-2);
  }
  .diff-line.type-deletion > * {
    color: var(--color-negative-6);
    background-color: var(--color-negative-2);
  }
  .diff-line.selected > * {
    color: var(--color-foreground-6);
    background-color: var(--color-foreground-4);
  }
  .diff-line.selected.type-addition > * {
    color: var(--color-positive-6);
    background-color: var(--color-positive-4);
  }
  .diff-line.selected.type-deletion > * {
    color: var(--color-negative-6);
    background-color: var(--color-negative-4);
  }
  .diff-line.hunk-header.selected {
    background-color: var(--color-foreground-4);
  }
  .diff-line-number {
    text-align: right;
    user-select: none;
    line-height: 1.5rem;
    min-width: 3rem;
    cursor: pointer;
  }
  .diff-line-number.left {
    position: relative;
    padding: 0 0.5rem 0 0.75rem;
  }
  .selection-indicator {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
  }
  .diff-line.selected .selection-indicator {
    background: var(--color-primary);
  }
  .diff-line-number.right {
    padding: 0 0.75rem 0 0.5rem;
  }
  .diff-line-content {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    width: 100%;
    padding-right: 0.5rem;
  }
  .diff-line-type {
    text-align: center;
    padding-left: 0.75rem;
    padding-right: 0.75rem;
    user-select: none;
  }
  .diff-expand-header {
    padding-left: 0.5rem;
    color: var(--color-foreground-5);
  }
  .diff-line-number {
    color: var(--color-foreground-5);
  }
</style>

<div id={file.path} class="wrapper">
  <header class="header">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="expand-button" on:click={() => (collapsed = !collapsed)}>
      {#if collapsed}
        <Icon name="chevron-right" />
      {:else}
        <Icon name="chevron-down" />
      {/if}
    </div>
    <div class="actions">
      <p class="txt-regular">{file.path}</p>
      {#if headerBadgeCaption === "added"}
        <Badge variant="positive">added</Badge>
      {:else if headerBadgeCaption === "deleted"}
        <Badge variant="negative">deleted</Badge>
      {/if}
    </div>
    <div class="browse" title="View file">
      <Link
        route={{
          resource: "project.tree",
          project: projectId,
          node: baseUrl,
          path: file.path,
          revision,
        }}>
        <Icon name="browse" />
      </Link>
    </div>
  </header>
  {#if !collapsed}
    <main>
      {#if file.diff.type === "plain"}
        {#if file.diff.hunks.length > 0}
          <table class="diff" data-file-diff-select>
            {#each file.diff.hunks as hunk, hunkIdx}
              <tr
                class="diff-line hunk-header"
                class:selected={hunkHeaderSelected(selection, hunkIdx)}>
                <td colspan={2} style:position="relative">
                  <div class="selection-indicator" />
                </td>
                <td colspan={6} class="diff-expand-header">
                  {hunk.header}
                </td>
              </tr>
              {#each hunk.lines as line, lineIdx}
                <tr
                  class={`diff-line type-${line.type}`}
                  class:selected={isLineSelected(selection, hunkIdx, lineIdx)}>
                  <td
                    id={[file.path, "H" + hunkIdx, "L" + lineIdx].join("-")}
                    class="diff-line-number left"
                    on:click={e => selectLine(hunkIdx, lineIdx, e)}>
                    <div class="selection-indicator" />
                    {lineNumberL(line)}
                  </td>
                  <td
                    class="diff-line-number right"
                    on:click={e => selectLine(hunkIdx, lineIdx, e)}>
                    {lineNumberR(line)}
                  </td>
                  <td class="diff-line-type" data-line-type={line.type}>
                    {lineSign(line)}
                  </td>
                  <td class="diff-line-content">{line.line}</td>
                </tr>
              {/each}
            {/each}
          </table>
        {:else}
          <div class="placeholder">Empty file</div>
        {/if}
      {:else}
        <div class="placeholder">Binary file</div>
      {/if}
    </main>
  {/if}
</div>
