<script lang="ts">
  import type { BaseUrl, Blob } from "@httpd-client";

  import { afterUpdate, onDestroy, onMount } from "svelte";
  import { toHtml } from "hast-util-to-html";

  import * as Syntax from "@app/lib/syntax";
  import { isMarkdownPath, twemoji } from "@app/lib/utils";
  import { lineNumbersGutter } from "@app/lib/syntax";

  import Readme from "@app/views/projects/Readme.svelte";
  import SquareButton from "@app/components/SquareButton.svelte";

  export let baseUrl: BaseUrl;
  export let projectId: string;
  export let peer: string | undefined;
  export let revision: string | undefined;
  export let path: string;
  export let hash: string | undefined = undefined;
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
  updateSelectedLineId();

  function updateSelectedLineId() {
    const fragmentId = window.location.hash.substr(1);
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
  header .file-header {
    display: flex;
    height: 3rem;
    align-items: center;
    justify-content: space-between;
    padding: 0 0.5rem 0 1rem;
    color: var(--color-foreground);
    border-width: 1px 1px 0 1px;
    border-color: var(--color-foreground-3);
    border-style: solid;
    border-top-left-radius: var(--border-radius-small);
    border-top-right-radius: var(--border-radius-small);
  }

  .file-header .right {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    overflow-x: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }

  header .file-name {
    font-weight: var(--font-weight-normal);
    flex-shrink: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 1rem;
  }

  .last-commit {
    padding: 0.5rem 0.75rem;
    color: var(--color-secondary);
    background-color: var(--color-secondary-2);
    font-size: var(--font-size-tiny);
    border-radius: var(--border-radius-small);
    overflow-x: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .last-commit .hash {
    font-weight: var(--font-weight-bold);
    font-family: var(--font-family-monospace);
    margin-right: 0.25rem;
  }

  .toggle {
    margin-right: 0.5rem;
  }

  .code :global(.line-number) {
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
    background-color: var(--color-caution-3);
  }
  .code :global(.highlight td a) {
    color: var(--color-foreground);
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
    border: 1px solid var(--color-foreground-3);
    border-top-style: dashed;
    border-bottom-left-radius: var(--border-radius-small);
    border-bottom-right-radius: var(--border-radius-small);
    background: var(--color-background-1);
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

  .markdown {
    max-width: 64rem;
  }

  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 960px) {
    .code {
      font-size: var(--font-size-small);
    }
  }

  @media (max-width: 720px) {
    .right {
      justify-content: center;
    }
  }
</style>

<div class:markdown={isMarkdown}>
  <header>
    <div class="file-header">
      <span class="file-name">
        <span style:color="var(--color-foreground-5)">{parentDir}</span>
        &#8203;
        <span>{blob.name}</span>
      </span>
      <div class="right">
        {#if isMarkdown}
          <div title="Toggle render method" class="toggle">
            <SquareButton clickable on:click={toggleMarkdown}>
              {showMarkdown ? "Plain" : "Markdown"}
            </SquareButton>
          </div>
        {/if}
        <a href="{rawPath}/{blob.path}" class="toggle">
          <SquareButton clickable>Raw</SquareButton>
        </a>
        <div class="last-commit" title={lastCommit.author.name} use:twemoji>
          <span class="hash">
            {lastCommit.id.slice(0, 7)}
          </span>
          {lastCommit.summary}
        </div>
      </div>
    </div>
  </header>
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
        {path}
        {hash} />
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
</div>
