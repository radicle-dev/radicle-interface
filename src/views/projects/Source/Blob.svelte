<script lang="ts">
  import type { BaseUrl, Blob } from "@httpd-client";

  import { afterUpdate, onDestroy, onMount } from "svelte";
  import { toHtml } from "hast-util-to-html";

  import * as Syntax from "@app/lib/syntax";
  import { isMarkdownPath, twemoji } from "@app/lib/utils";
  import { lineNumbersGutter } from "@app/lib/syntax";

  import IconSmall from "@app/components/IconSmall.svelte";
  import Link from "@app/components/Link.svelte";
  import Radio from "@app/components/Radio.svelte";
  import Readme from "./Readme.svelte";
  import Button from "@app/components/Button.svelte";

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
    padding: 0 0.5rem 0 1rem;
    color: var(--color-foreground);
    border-width: 1px 1px 0 1px;
    border-color: var(--color-border-hint);
    border-style: solid;
    border-top-left-radius: var(--border-radius-small);
    border-top-right-radius: var(--border-radius-small);
  }

  .right {
    display: flex;
    gap: 0.5rem;
    margin-left: auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .file-name {
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-small);
    flex-shrink: 0;
    padding-right: 0.5rem;
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
  .commit-teaser {
    display: flex;
    align-items: center;
    overflow: hidden;
    border-radius: var(--border-radius-tiny);
    font-family: var(--font-family-monospace);
    font-size: var(--font-size-small);
    background-color: var(--color-fill-ghost);
    gap: 0.75rem;
    padding-right: 0.75rem;
  }

  @media (max-width: 720px) {
    .file-header {
      border-top-left-radius: 0;
      border-top-right-radius: 0;
      border-left: none;
      border-right: none;
    }
    .hash {
      display: none;
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
    <div class="commit-teaser">
      <Link
        route={{
          resource: "project.commit",
          project: projectId,
          node: baseUrl,
          commit: lastCommit.id,
        }}>
        <Button variant="dim" square>
          <span class="hash">{lastCommit.id.slice(0, 7)}</span>
        </Button>
      </Link>
      {lastCommit.summary}
    </div>
    <div class="layout-desktop-flex" style:gap="0.5rem">
      {#if isMarkdown}
        <Radio ariaLabel="Toggle render method">
          <Button
            square
            variant={showMarkdown ? "secondary" : "gray"}
            on:click={() => {
              window.location.hash = "";
              showMarkdown = true;
            }}>
            Plain
          </Button>
          <Button
            square
            variant={!showMarkdown ? "secondary" : "gray"}
            on:click={() => {
              showMarkdown = false;
            }}>
            Markdown
          </Button>
        </Radio>
      {/if}
      <a href="{rawPath}/{blob.path}">
        <Button variant="secondary">
          Raw
          <IconSmall name="arrow-box-up-right" />
        </Button>
      </a>
    </div>
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
