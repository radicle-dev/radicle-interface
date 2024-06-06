<script lang="ts">
  import type {
    BaseUrl,
    ChangesetWithDiff,
    DiffContent,
    HunkLine,
  } from "@http-client";

  import { onDestroy, onMount } from "svelte";
  import { toHtml } from "hast-util-to-html";

  import * as Syntax from "@app/lib/syntax";
  import { isImagePath, isSvgPath } from "@app/lib/utils";

  import Badge from "@app/components/Badge.svelte";
  import File from "@app/components/File.svelte";
  import FilePath from "@app/components/FilePath.svelte";
  import IconButton from "@app/components/IconButton.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Link from "@app/components/Link.svelte";
  import Loading from "@app/components/Loading.svelte";
  import Placeholder from "@app/components/Placeholder.svelte";
  import Radio from "@app/components/Radio.svelte";
  import Button from "@app/components/Button.svelte";

  export let filePath: string;
  export let oldContent: string | undefined = undefined;
  export let content: string | undefined = undefined;
  export let oldFilePath: string | undefined = undefined;
  export let fileDiff: DiffContent;
  export let headerBadgeCaption: ChangesetWithDiff["state"];
  export let revision: string | undefined = undefined;
  export let baseUrl: BaseUrl;
  export let projectId: string;
  export let visible: boolean = false;
  export let expanded: boolean = true;

  let selection: Selection | undefined = undefined;
  let highlighting: { new?: string[]; old?: string[] } | undefined = undefined;
  let syntaxHighlightingLoading: boolean = false;
  let preview = false;
  $: extension = filePath.split(".").pop();

  onMount(() => {
    window.addEventListener("click", deselectHandler);
    window.addEventListener("hashchange", updateSelection);

    updateSelection();

    if (selection) {
      document
        .getElementById(
          [filePath, "H" + selection.startHunk, "L" + selection.startLine].join(
            "-",
          ),
        )
        ?.scrollIntoView({ block: "center" });
    }
  });

  $: if (visible) {
    syntaxHighlightingLoading = true;
    void highlightContent().then(output => {
      highlighting = output;
      syntaxHighlightingLoading = false;
    });
  }

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

  async function highlightContent() {
    const extension = filePath.split(".").pop();
    const highlighted: { new?: string[]; old?: string[] } = {};
    if (extension) {
      if (content) {
        highlighted["new"] = toHtml(
          await Syntax.highlight(content, extension),
        ).split("\n");
      }
      if (oldContent) {
        highlighted["old"] = toHtml(
          await Syntax.highlight(oldContent, extension),
        ).split("\n");
      }
    }
    return Object.entries(highlighted).length > 0 ? highlighted : undefined;
  }

  function updateSelection() {
    const fragment = window.location.hash.substring(1);
    const match = fragment.match(/(.+):H(\d+)L(\d+)(H(\d+)L(\d+))?/);
    if (match && match[1] === filePath) {
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
    const path = filePath;
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
  .container {
    font-size: var(--font-size-small);
    background: var(--color-background-float);
    border-radius: 0 0 var(--border-radius-small) var(--border-radius-small);
    overflow-x: auto;
  }
  .actions {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1rem;
  }
  .browse {
    margin-left: auto;
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
    background-color: var(--color-fill-diff-green-light);
  }
  .diff-line.type-deletion > * {
    background-color: var(--color-fill-diff-red-light);
  }

  .diff-line.selected > * {
    background-color: var(--color-fill-float-hover);
  }
  .diff-line.selected.type-addition > * {
    background-color: var(--color-fill-diff-green);
  }
  .diff-line.selected.type-deletion > * {
    background-color: var(--color-fill-diff-red);
  }

  .type-addition > .diff-line-number,
  .type-addition > .diff-line-type {
    color: var(--color-foreground-success);
  }
  .type-deletion > .diff-line-number,
  .type-deletion > .diff-line-type {
    color: var(--color-foreground-red);
  }

  .diff-line.selected .selection-indicator-left {
    background-color: var(--color-fill-secondary);
  }
  .type-addition.diff-line.selected .selection-indicator-left {
    background-color: var(--color-fill-secondary);
  }
  .type-deletion.diff-line.selected .selection-indicator-left {
    background-color: var(--color-fill-secondary);
  }

  .diff-line.selected .selection-indicator-right {
    background-color: var(--color-fill-secondary);
  }
  .type-addition.diff-line.selected .selection-indicator-right {
    background-color: var(--color-fill-secondary);
  }
  .type-deletion.diff-line.selected .selection-indicator-right {
    background-color: var(--color-fill-secondary);
  }

  .selection-start {
    box-shadow: 0 -1px 0 0 var(--color-fill-secondary);
    z-index: 1;
  }
  .selection-end {
    box-shadow: 0 1px 0 0 var(--color-fill-secondary);
    z-index: 1;
  }

  .selection-start.selection-end {
    box-shadow: 0 0 0 1px var(--color-fill-secondary);
    z-index: 1;
  }

  .diff-line-number {
    font-family: var(--font-family-monospace);
    text-align: right;
    user-select: none;
    line-height: 1.5rem;
    min-width: 3rem;
    cursor: pointer;
    color: var(--color-foreground-disabled);
  }
  .diff-line-number.left {
    position: relative;
    padding: 0 0.5rem 0 0.75rem;
  }
  .selection-indicator-left {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 1px;
  }
  .selection-indicator-right {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 1px;
  }
  .diff-line-number.right {
    padding: 0 0.75rem 0 0.5rem;
  }
  .diff-line-content {
    color: unset !important;
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
    color: var(--color-foreground-dim);
  }
</style>

<File collapsable {expanded}>
  <svelte:fragment slot="left-header">
    {#if (headerBadgeCaption === "moved" || headerBadgeCaption === "copied") && oldFilePath}
      <span style="display: flex; align-items: center; flex-wrap: wrap;">
        <FilePath filenameWithPath={oldFilePath} />
        <span style:padding="0 0.5rem">→</span>
        <FilePath filenameWithPath={filePath} />
      </span>
    {:else}
      <FilePath filenameWithPath={filePath} />
    {/if}

    {#if headerBadgeCaption === "added"}
      <Badge variant="positive">added</Badge>
    {:else if headerBadgeCaption === "deleted"}
      <Badge variant="negative">deleted</Badge>
    {:else if headerBadgeCaption === "moved"}
      <Badge variant="foreground">moved</Badge>
    {:else if headerBadgeCaption === "copied"}
      <Badge variant="foreground">copied</Badge>
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="right-header" let:expanded>
    {#if revision}
      {#if syntaxHighlightingLoading}
        <Loading small />
      {/if}
      <div style:display="flex" style:align-items="center" style:gap="0.5rem">
        {#if isSvgPath(filePath) && expanded}
          <Radio ariaLabel="Toggle render method">
            <Button
              styleBorderRadius="0"
              variant={!preview ? "selected" : "not-selected"}
              on:click={() => {
                preview = false;
              }}>
              <IconSmall name="chevron-left-right" />Code
            </Button>
            <Button
              styleBorderRadius="0"
              variant={preview ? "selected" : "not-selected"}
              on:click={() => {
                window.location.hash = "";
                preview = true;
              }}>
              <IconSmall name="eye-open" />Preview
            </Button>
          </Radio>
        {/if}
        <Link
          route={{
            resource: "project.source",
            project: projectId,
            node: baseUrl,
            path: filePath,
            revision,
          }}>
          <IconButton title="View file at this commit">
            <IconSmall name="chevron-left-right" />
          </IconButton>
        </Link>
      </div>
    {/if}
  </svelte:fragment>

  <div class="container">
    {#if fileDiff.type === "plain"}
      {#if fileDiff.hunks.length > 0 && !preview}
        <table class="diff" data-file-diff-select>
          {#each fileDiff.hunks as hunk, hunkIdx}
            <tr
              class="diff-line hunk-header"
              class:selected={hunkHeaderSelected(selection, hunkIdx)}>
              <td colspan={2} style:position="relative">
                <div class="selection-indicator-left" />
              </td>
              <td
                colspan={6}
                class="diff-expand-header"
                style:position="relative">
                {hunk.header}
                <div class="selection-indicator-right" />
              </td>
            </tr>
            {#each hunk.lines as line, lineIdx}
              <tr
                style:position="relative"
                class={`diff-line type-${line.type}`}
                class:selection-start={selection?.startHunk === hunkIdx &&
                  selection.startLine === lineIdx}
                class:selection-end={(selection?.endHunk === hunkIdx &&
                  selection.endLine === lineIdx) ||
                  (selection?.startHunk === hunkIdx &&
                    selection.startLine === lineIdx &&
                    selection?.endHunk === undefined)}
                class:selected={isLineSelected(selection, hunkIdx, lineIdx)}>
                <td
                  id={[filePath, "H" + hunkIdx, "L" + lineIdx].join("-")}
                  class="diff-line-number left"
                  on:click={e => selectLine(hunkIdx, lineIdx, e)}>
                  <div class="selection-indicator-left" />
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
                <td class="diff-line-content">
                  {#if highlighting}
                    {#if line.type === "addition" && highlighting.new}
                      {@html highlighting.new[line.lineNo - 1]}
                    {:else if line.type === "context" && highlighting.new}
                      {@html highlighting.new[line.lineNoNew - 1]}
                    {:else if line.type === "deletion" && highlighting.old}
                      {@html highlighting.old[line.lineNo - 1]}
                    {/if}
                  {:else}
                    {line.line}
                  {/if}
                </td>
                <div class="selection-indicator-right" />
              </tr>
            {/each}
          {/each}
        </table>
      {:else if isImagePath(filePath) && extension && content}
        <div style:margin="1rem 0" style:text-align="center">
          <img
            src={`data:image/${extension};base64,${content}`}
            alt={filePath} />
        </div>
      {:else if preview && content}
        <div style:margin="1rem 0" style:text-align="center">
          <img
            src={`data:image/svg+xml;base64,${btoa(content)}`}
            alt={filePath} />
        </div>
      {:else}
        <div style:margin="1rem 0">
          <Placeholder iconName="empty-file" caption="Empty file" inline />
        </div>
      {/if}
    {:else}
      <div style:margin="1rem 0">
        <Placeholder iconName="binary-file" caption="Binary file" inline />
      </div>
    {/if}
  </div>
</File>
