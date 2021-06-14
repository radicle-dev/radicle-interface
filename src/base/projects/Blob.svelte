<script lang="typescript">
  import type { Blob } from "@app/project";

  export let blob: Blob;

  const lastCommit = blob.info.lastCommit;
  const lines = (blob.content.match(/\n/g) || []).length;
  const lineNumbers = Array(lines).fill(0).map((_, index) => (index + 1).toString());
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
    border-color: var(--color-foreground-subtle);
    border-style: solid;
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
  }

  header .file-name {
    font-weight: normal;
  }

  .last-commit {
    padding: 0.5rem;
    color: var(--color-secondary);
    background-color: var(--color-secondary-background);
    font-size: 0.75rem;
    border-radius: 0.25rem;
  }
  .last-commit .hash {
    font-weight: bold;
    font-family: var(--font-family-monospace);
    margin-right: 0.25rem;
  }

  .line-numbers {
    color: var(--color-foreground-subtle);
    font-family: var(--font-family-sans-serif);
    text-align: right;
    user-select: none;
    padding: 0 1rem 0.5rem 1rem;
  }

  .code {
    padding-bottom: 0.5rem;
    overflow-x: auto;
  }

  .container {
    display: flex;
    border: 1px solid var(--color-foreground-subtle);
    border-top-style: dashed;
  }

  .no-scrollbar {
    scrollbar-width: none;
  }

  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
</style>

<div>
  <div class="file-source">
    <header>
      <div class="file-header">
        <span class="file-name">
          <span>{blob.path.split("/").join(" / ")}</span>
        </span>
        <div class="last-commit" title="{lastCommit.author.name}">
          <span class="hash">{lastCommit.sha1.slice(0, 7)}</span>
          {lastCommit.summary}
        </div>
      </div>
    </header>
    <div class="container">
      {#if blob.binary}
        👀 Binary content
      {:else}
        <pre class="line-numbers">
          {@html lineNumbers.join("\n")}
        </pre>
        <pre
          class="code no-scrollbar">
          {#if blob.html}
            {@html blob.content}
          {:else}
            {blob.content}
          {/if}
        </pre>
      {/if}
    </div>
  </div>
</div>
