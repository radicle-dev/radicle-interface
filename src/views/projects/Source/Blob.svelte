<script lang="ts">
  import type { BaseUrl, Blob } from "@httpd-client";

  import { afterUpdate, onDestroy, onMount } from "svelte";
  import { toHtml } from "hast-util-to-html";

  import * as Syntax from "@app/lib/syntax";
  import { isMarkdownPath } from "@app/lib/utils";
  import { lineNumbersGutter } from "@app/lib/syntax";
  import { routeToPath } from "@app/lib/router";

  import Button from "@app/components/Button.svelte";
  import File from "@app/components/File.svelte";
  import FilePath from "@app/components/FilePath.svelte";
  import InlineMarkdown from "@app/components/InlineMarkdown.svelte";
  import Link from "@app/components/Link.svelte";
  import Markdown from "@app/components/Markdown.svelte";
  import Placeholder from "@app/components/Placeholder.svelte";
  import Radio from "@app/components/Radio.svelte";

  export let baseUrl: BaseUrl;
  export let projectId: string;
  export let peer: string | undefined;
  export let revision: string | undefined;
  export let path: string;
  export let blob: Blob;
  export let highlighted: Syntax.Root | undefined;
  export let rawPath: string;

  $: lastCommit = blob.lastCommit;

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

  let linkBaseUrl: string | undefined;

  $: {
    if (!path || path === "/") {
      // For the default root path, the `tree/<revision>` portion is omitted
      // from the URL. This means that links cannot be resolved with respect
      // to the current location. To work around this we provide path that
      // results a fully expanded URL with which we can resolve all links in the
      // Markdown.
      linkBaseUrl = new URL(
        routeToPath({
          resource: "project.source",
          project: projectId,
          node: baseUrl,
          peer,
          revision,
          path: "README.md",
        }),
        window.origin,
      ).href;
    } else {
      linkBaseUrl = undefined;
    }
  }

  afterUpdate(() => {
    for (const item of document.getElementsByClassName("highlight")) {
      item.classList.remove("highlight");
    }
    if (selectedLineId) {
      const target = document.getElementById(selectedLineId);
      if (target) {
        target.classList.add("highlight");
        target.scrollIntoView({ block: "center" });
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
  .code :global(.line-number) {
    font-family: var(--font-family-monospace);
    color: var(--color-foreground-disabled);
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
    color: var(--color-foreground-dim);
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
    background-color: var(--color-fill-float-hover);
    box-shadow: 0 0 0 1px var(--color-fill-secondary);
  }
  .code :global(.highlight td:first-child) {
    background-color: var(--color-fill-float-hover);
    border-left: 1px solid var(--color-fill-secondary);
  }
  .code :global(.highlight td:last-child) {
    background-color: var(--color-fill-float-hover);
    border-right: 1px solid var(--color-fill-secondary);
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

  .teaser-buttons {
    display: flex;
    gap: 0.5rem;
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
    background-color: var(--color-fill-ghost-hover);
    gap: 0.75rem;
    padding-right: 0.75rem;
    height: var(--button-small-height);
  }
</style>

<File sticky={false}>
  <FilePath slot="left-header" filenameWithPath={blob.path} />
  <svelte:fragment slot="right-header">
    <div class="commit-teaser">
      <div class="hash-button">
        <Link
          route={{
            resource: "project.commit",
            project: projectId,
            node: baseUrl,
            commit: lastCommit.id,
          }}>
          <Button variant="gray" styleBorderRadius="0">
            <span class="global-commit">
              {lastCommit.id.slice(0, 7)}
            </span>
          </Button>
        </Link>
      </div>
      <div style:white-space="nowrap">
        <InlineMarkdown fontSize="small" content={lastCommit.summary} />
      </div>
    </div>
    <div class="global-hide-on-mobile teaser-buttons">
      {#if isMarkdown}
        <Radio ariaLabel="Toggle render method">
          <Button
            styleBorderRadius="0"
            variant={showMarkdown ? "selected" : "not-selected"}
            on:click={() => {
              window.location.hash = "";
              showMarkdown = true;
            }}>
            Markdown
          </Button>
          <Button
            styleBorderRadius="0"
            variant={!showMarkdown ? "selected" : "not-selected"}
            on:click={() => {
              showMarkdown = false;
            }}>
            Plain
          </Button>
        </Radio>
      {/if}
      <a href="{rawPath}/{blob.path}">
        <Button variant="gray-white">Raw</Button>
      </a>
    </div>
  </svelte:fragment>

  {#if blob.binary}
    <div style:margin="4rem 0" style:width="100%">
      <Placeholder iconName="binary-file" caption="Binary file" />
    </div>
  {:else if showMarkdown && blob.content}
    <div style:padding="2rem">
      <Markdown {linkBaseUrl} content={blob.content} {rawPath} {path} />
    </div>
  {:else if content}
    <table class="code no-scrollbar">
      {@html toHtml(content)}
    </table>
  {:else}
    <div style:margin="4rem 0" style:width="100%">
      <Placeholder iconName="empty-file" caption="Empty file" />
    </div>
  {/if}
</File>
