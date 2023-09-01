<script lang="ts">
  import type { BaseUrl, Blob } from "@httpd-client";

  import { afterUpdate, onDestroy, onMount } from "svelte";
  import { toHtml } from "hast-util-to-html";

  import * as Syntax from "@app/lib/syntax";
  import { isMarkdownPath, twemoji } from "@app/lib/utils";
  import { lineNumbersGutter } from "@app/lib/syntax";

  import Readme from "./Readme.svelte";
  import SquareButton from "@app/components/SquareButton.svelte";

  export let baseUrl: BaseUrl;
  export let projectId: string;
  export let peer: string | undefined;
  export let revision: string | undefined;
  export let path: string;
  export let blob: Blob;
  export let highlighted: Syntax.Root | undefined;
  export let rawPath: string;

  $: lastCommit = blob.lastCommit;

  $: parentDir = blob.path
    .match(/^.*\/|/)
    ?.values()
    .next().value;

  $: content = highlighted ? lineNumbersGutter(highlighted) : undefined;

  let selectedLineId: string | undefined = undefined;
  $: {
    content;
    updateSelectedLineId();
  }

  function updateSelectedLineId() {
    const fragmentId = window.location.hash.substring(1);
    if (fragmentId && fragmentId.match(/^L\d+$/)) {
      selectedLineId = fragmentId;
    } else {
      selectedLineId = undefined;
    }
  }

  $: isMarkdown = isMarkdownPath(blob.path);
  $: showMarkdown = isMarkdown && selectedLineId === undefined;

  function toggleMarkdown() {
    window.location.hash = "";
    showMarkdown = !showMarkdown;
  }

  afterUpdate(() => {
    for (const item of document.getElementsByClassName("highlight")) {
      item.classList.remove("highlight");
    }
    if (selectedLineId) {
      const target = document.getElementById(selectedLineId);
      if (target) {
        target.classList.add("highlight");
        target.scrollIntoView();
      }
    }
  });

  onMount(async () => {
    window.addEventListener("hashchange", updateSelectedLineId);
  });

  onDestroy(() => {
    window.removeEventListener("hashchange", updateSelectedLineId);
  });
</script>

<style>
  .file-header {
    display: flex;
    height: 3rem;
    align-items: center;
    justify-content: space-between;
    padding: 0 0.5rem 0 1rem;
    color: var(--color-foreground);
    border-width: 1px 1px 0 1px;
    border-color: var(--color-border-hint);
    border-style: solid;
    border-top-left-radius: var(--border-radius-small);
    border-top-right-radius: var(--border-radius-small);
    gap: 0.5rem;
  }

  .file-header .right {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    overflow-x: hidden;
    text-overflow: ellipsis;
    width: 100%;
    gap: 0.5rem;
  }

  .file-name {
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-small);
    flex-shrink: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .last-commit {
    display: flex;
    align-items: center;
    padding: 0 0.75rem;
    height: 2rem;
    font-family: var(--font-family-monospace);
    color: var(--color-secondary);
    background-color: var(--color-fill-ghost);
    font-size: var(--font-size-small);
    border-radius: var(--border-radius-small);
    overflow-x: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .last-commit .hash {
    font-weight: var(--font-weight-bold);
    font-family: var(--font-family-monospace);
    margin-right: 0.5rem;
    color: var(--color-fill-secondary);
  }

  .code :global(.line-number) {
    font-family: var(--font-family-monospace);
    color: var(--color-foreground-4);
    text-align: right;
    padding: 0;
    user-select: none;
  }
  .code :global(.line-number a) {
    display: block;
    padding: 0 1rem;
  }
  .code :global(.line-number:hover) {
    cursor: pointer;
    color: var(--color-foreground);
  }

  .code :global(.content) {
    display: inline;
    font-family: var(--font-family-monospace);
    margin: 0;
  }

  .code :global(.line) {
    line-height: 22px; /* This seems to be the line-height of a pre code block */
  }
  .code :global(.highlight) {
    background-color: var(--color-fill-yellow);
    color: var(--color-foreground-black);
  }
  .code :global(.highlight td a) {
    color: var(--color-foreground-black);
  }

  .code :global(.line-content) {
    padding: 0;
    width: 100%;
  }

  .code {
    width: 100%;
    border-spacing: 0;
    overflow-x: auto;
    font-size: var(--font-size-small);
    padding-top: 1rem;
    margin-bottom: 1.5rem;
  }

  .container {
    position: relative;
    display: flex;
    overflow-x: auto;
    border: 1px solid var(--color-border-hint);
    border-top-style: solid;
    border-bottom-left-radius: var(--border-radius-small);
    border-bottom-right-radius: var(--border-radius-small);
    background: var(--color-background-float);
  }

  .binary {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 16rem;
    background-color: var(--color-foreground-1);
    color: var(--color-foreground-6);
    font-family: var(--font-family-monospace);
  }
  .binary > * {
    margin-bottom: 1rem;
  }

  .no-scrollbar {
    scrollbar-width: none;
  }

  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 720px) {
    .file-header {
      border-top-left-radius: 0;
      border-top-right-radius: 0;
      border-left: none;
      border-right: none;
    }
    .container {
      border-left: none;
      border-right: none;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
  }
</style>

<div class="file-header">
  <span class="file-name">
    <span style:color="var(--color-foreground-5)">{parentDir}</span>
    &#8203;
    <span>{blob.name}</span>
  </span>
  <div class="right">
    <div class="last-commit" title={lastCommit.author.name} use:twemoji>
      <span class="hash">
        {lastCommit.id.slice(0, 7)}
      </span>
      {lastCommit.summary}
    </div>
  </div>
  <div class="layout-desktop-flex" style:gap="0.5rem">
    {#if isMarkdown}
      <div title="Toggle render method">
        <SquareButton variant="secondary" clickable on:click={toggleMarkdown}>
          {showMarkdown ? "Plain" : "Markdown"}
        </SquareButton>
      </div>
    {/if}
    <a href="{rawPath}/{blob.path}">
      <SquareButton variant="secondary" clickable>Raw</SquareButton>
    </a>
  </div>
</div>

<div class="container">
  {#if blob.binary}
    <div class="binary">
      <div use:twemoji>👀</div>
      <span class="txt-tiny">Binary content</span>
    </div>
  {:else if showMarkdown && blob.content}
    <Readme
      {baseUrl}
      {projectId}
      {peer}
      {revision}
      content={blob.content}
      {rawPath}
      {path} />
  {:else if content}
    <table class="code no-scrollbar">
      {@html toHtml(content)}
    </table>
  {:else}
    <div class="binary">
      <div use:twemoji>🍂</div>
      <span class="txt-tiny">Empty file</span>
    </div>
  {/if}
</div>
