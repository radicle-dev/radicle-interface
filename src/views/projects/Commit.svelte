<script lang="ts">
  import type { BaseUrl, Commit, Project } from "@httpd-client";

  import { formatCommit } from "@app/lib/utils";

  import Changeset from "@app/views/projects/Changeset.svelte";
  import Clipboard from "@app/components/Clipboard.svelte";
  import CommitAuthorship from "@app/views/projects/Commit/CommitAuthorship.svelte";
  import InlineMarkdown from "@app/components/InlineMarkdown.svelte";
  import Layout from "./Layout.svelte";

  export let baseUrl: BaseUrl;
  export let commit: Commit;
  export let project: Project;

  $: header = commit.commit;
</script>

<style>
  .commit {
    padding: 1rem 2rem 0 8rem;
  }
  .header {
    padding: 1rem;
    margin-bottom: 1.5rem;
    border-radius: var(--border-radius);
    border: 1px solid var(--color-foreground-3);
  }
  .summary {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  .description {
    font-family: var(--font-family-monospace);
    margin: 1rem 0;
    white-space: pre-wrap;
  }
  .sha1 {
    align-items: center;
    color: var(--color-foreground-5);
    font-size: var(--font-size-small);
  }

  @media (max-width: 960px) {
    .commit {
      padding-left: 2rem;
    }
  }
</style>

<Layout {baseUrl} {project}>
  <div class="commit">
    <div class="header">
      <div class="summary">
        <div class="txt-medium txt-bold">
          <InlineMarkdown fontSize="medium" content={header.summary} />
        </div>
        <div class="layout-desktop-flex txt-monospace sha1">
          <span>{header.id}</span>
          <Clipboard small text={header.id} />
        </div>
        <div class="layout-mobile-flex txt-monospace sha1 txt-small">
          {formatCommit(header.id)}
          <Clipboard small text={header.id} />
        </div>
      </div>
      <pre class="description txt-small">{header.description}</pre>
      <CommitAuthorship {header} />
    </div>
    <Changeset
      {baseUrl}
      projectId={project.id}
      files={commit.files}
      diff={commit.diff}
      revision={commit.commit.id} />
  </div>
</Layout>
