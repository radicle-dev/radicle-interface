<script lang="ts">
  import type { BaseUrl, Commit, Project } from "@httpd-client";

  import { formatCommit } from "@app/lib/utils";

  import Changeset from "@app/views/projects/Changeset.svelte";
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
    background-color: var(--color-background-float);
  }
  .header {
    padding: 0 1rem 1rem 1rem;
    border-radius: var(--border-radius-small);
    border-bottom: 1px solid var(--color-border-hint);
  }
  .description {
    font-family: var(--font-family-monospace);
    white-space: pre-wrap;
    margin-top: 1.5rem;
  }
</style>

<Layout {baseUrl} {project}>
  <div class="commit">
    <div class="header">
      <div style="display:flex; flex-direction: column; gap: 0.5rem;">
        <InlineMarkdown fontSize="large" content={header.summary} />
        <CommitAuthorship {header}>
          <span class="global-commit">{formatCommit(header.id)}</span>
        </CommitAuthorship>
      </div>
      {#if header.description}
        <pre class="description txt-small">{header.description}</pre>{/if}
    </div>
    <Changeset
      {baseUrl}
      projectId={project.id}
      files={commit.files}
      diff={commit.diff}
      revision={commit.commit.id} />
  </div>
</Layout>
