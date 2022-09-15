<script lang="ts">
  import type { Blob } from "@app/project";
  import { onMount } from "svelte";

  export let blob: Blob;
  export let line: number | null;

  const lastCommit = blob.info.lastCommit;
  const lines = blob.binary ? 0 : (blob.content.match(/\n/g) || []).length;
  const lineNumbers = Array(lines)
    .fill(0)
    .map((_, index) => index + 1);
  const parentDir = blob.path
    .match(/^.*\/|/)
    ?.values()
    .next().value;

  // Waiting onMount, due to the line numbers still loading.
  onMount(() => {
    const lineElement = document.getElementById(`L${line}`);
    if (lineElement) lineElement.scrollIntoView();
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

  header .file-name {
    font-weight: var(--font-weight-normal);
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

  .line-numbers {
    color: var(--color-foreground-4);
    font-family: var(--font-family-sans-serif);
    text-align: right;
    user-select: none;
    padding: 1rem 1rem 0.5rem 1rem;
  }
  .line-number {
    display: block;
  }
  .line-number:hover,
  .line-number.highlighted {
    color: var(--color-foreground-6);
  }

  .code {
    padding-bottom: 0.5rem;
    overflow-x: auto;
  }

  .container {
    position: relative;
    display: flex;
    border: 1px solid var(--color-foreground-3);
    border-top-style: dashed;
    border-bottom-left-radius: var(--border-radius-small);
    border-bottom-right-radius: var(--border-radius-small);
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

  .highlight {
    position: absolute;
    width: 100%;
    height: 1.5rem;
    top: 1rem;
    background-color: var(--color-caution-3);
  }

  .no-scrollbar {
    scrollbar-width: none;
  }

  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 960px) {
    .code,
    .line-numbers {
      font-size: var(--font-size-small);
    }
    .highlight {
      display: none;
    }
  }
</style>

<div>
  <div class="file-source">
    <header>
      <div class="file-header">
        <span class="file-name">
          <span class="faded">{parentDir}</span>
          &#8203;
          <span>{blob.info.name}</span>
        </span>
        <div class="last-commit" title={lastCommit.author.name}>
          <span class="hash">{lastCommit.sha1.slice(0, 7)}</span>
          {lastCommit.summary}
        </div>
      </div>
    </header>
    <div class="container">
      {#if blob.binary}
        <div class="binary">
          <div>👀</div>
          <span class="txt-tiny">Binary content</span>
        </div>
      {:else}
        {#if line}
          <div
            class="highlight"
            style="top: {line === 1 ? 1 : 1.5 * line - 0.5}rem" />
        {/if}
        <div class="line-numbers">
          {#each lineNumbers as lineNumber}
            <a
              href="#L{lineNumber}"
              class="line-number"
              class:highlighted={lineNumber === line}
              id="L{lineNumber}">
              {lineNumber}
            </a>
          {/each}
        </div>
        {#if blob.html}
          <pre class="code no-scrollbar">{@html blob.content}</pre>
        {:else}
          <pre class="code no-scrollbar">{blob.content}</pre>
        {/if}
      {/if}
    </div>
  </div>
</div>
