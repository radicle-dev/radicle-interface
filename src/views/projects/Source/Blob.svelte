<script lang="ts">
  import type { BaseUrl, Blob } from "@httpd-client";

  import { afterUpdate, onDestroy, onMount } from "svelte";
  import { toHtml } from "hast-util-to-html";

  import * as Syntax from "@app/lib/syntax";
  import { isMarkdownPath } from "@app/lib/utils";
  import { lineNumbersGutter } from "@app/lib/syntax";
  import { routeToPath } from "@app/lib/router";

  import Button from "@app/components/Button.svelte";
  import FilePath from "@app/components/FilePath.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Link from "@app/components/Link.svelte";
  import Markdown from "@app/components/Markdown.svelte";
  import Placeholder from "@app/components/Placeholder.svelte";
  import Radio from "@app/components/Radio.svelte";
  import InlineMarkdown from "@app/components/InlineMarkdown.svelte";

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
    color: var(--color-foreground-gray);
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

  .container {
    overflow-x: auto;
    border: 1px solid var(--color-border-hint);
    border-top-style: solid;
    border-bottom-left-radius: var(--border-radius-small);
    border-bottom-right-radius: var(--border-radius-small);
    background: var(--color-background-float);
    width: 100%;
    border-bottom-left-radius: var(--border-radius-small);
    border-bottom-right-radius: var(--border-radius-small);
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

  @media (max-width: 720px) {
    .commit-teaser {
      padding: 0 0.75rem;
    }
    .file-header {
      border-top-left-radius: 0;
      border-top-right-radius: 0;
      border-left: none;
      border-right: none;
    }
    .hash-button {
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
    <FilePath filenameWithPath={blob.path} />
  </span>
  <div class="right">
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
            <span
              class="global-hash"
              style:font-weight="var(--font-weight-bold)">
              {lastCommit.id.slice(0, 7)}
            </span>
          </Button>
        </Link>
      </div>
      <InlineMarkdown fontSize="small" content={lastCommit.summary} />
    </div>
    <div class="layout-desktop-flex" style:gap="0.5rem">
      {#if isMarkdown}
        <Radio ariaLabel="Toggle render method">
          <Button
            styleBorderRadius="0"
            variant={showMarkdown ? "secondary" : "gray"}
            on:click={() => {
              window.location.hash = "";
              showMarkdown = true;
            }}>
            Plain
          </Button>
          <Button
            styleBorderRadius="0"
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
</div>
