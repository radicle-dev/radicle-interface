<script lang="ts">
  import type { Blob } from "@app/lib/project";
  import type { MaybeHighlighted } from "@app/lib/syntax";
  import type { ProjectRoute } from "@app/lib/router/definitions";

  import HeaderToggleLabel from "@app/views/projects/HeaderToggleLabel.svelte";
  import Readme from "@app/views/projects/Readme.svelte";
  import { afterUpdate, beforeUpdate, onMount } from "svelte";
  import { highlight } from "@app/lib/syntax";
  import { isMarkdownPath, scrollIntoView, twemoji } from "@app/lib/utils";
  import { lineNumbersGutter } from "@app/lib/syntax";
  import { toHtml } from "hast-util-to-html";
  import { updateProjectRoute } from "@app/lib/router";

  export let activeRoute: ProjectRoute;
  export let blob: Blob;
  export let rawPath: string;
  export let line: string | undefined = undefined;

  const fileExtension = blob.path.split(".").pop() ?? "";
  const lastCommit = blob.lastCommit;

  const parentDir = blob.path
    .match(/^.*\/|/)
    ?.values()
    .next().value;
  let content: MaybeHighlighted = undefined;

  // Any time a user clicks on a line number, the `line` prop gets updated,
  // and the line is highlighted, but the previous line is not unhighlighted.
  // So we have to make sure here that any previous highlighting gets removed,
  // before updating the component.
  beforeUpdate(() => {
    for (const item of document.getElementsByClassName("highlight")) {
      item.classList.remove("highlight");
    }
  });

  onMount(async () => {
    if (!blob.content) {
      return;
    }
    const output = await highlight(blob.content, fileExtension);
    if (output) {
      content = lineNumbersGutter(output);
    }
  });

  afterUpdate(() => {
    if (line) {
      scrollIntoView(line);

      const element = document.getElementById(line);
      if (element) {
        element.classList.add("highlight");
      }
    }
  });

  const isMarkdown = isMarkdownPath(blob.path);
  // If we have a line number we should show the raw output.
  let showMarkdown = line ? false : isMarkdown;
  const toggleMarkdown = () => {
    updateProjectRoute({ line: undefined });
    showMarkdown = !showMarkdown;
  };
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
    padding: 0.5rem;
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

  .markdown-toggle {
    margin-right: 0.5rem;
  }

  .code :global(.line-number) {
    color: var(--color-foreground-4);
    text-align: right;
    padding-right: 1rem;
    padding-left: 1rem;
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
    font-size: var(--font-size-regular);
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
        <span class="txt-faded">{parentDir}</span>
        &#8203;
        <span>{blob.name}</span>
      </span>
      <div class="right">
        {#if isMarkdown}
          <div class="markdown-toggle">
            <HeaderToggleLabel
              active={!showMarkdown}
              clickable
              on:click={toggleMarkdown}>
              Raw
            </HeaderToggleLabel>
          </div>
        {/if}
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
      <Readme content={blob.content} {rawPath} {activeRoute} />
    {:else if content}
      <table class="code no-scrollbar">
        {@html toHtml(content)}
      </table>
    {/if}
  </div>
</div>
