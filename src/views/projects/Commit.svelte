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
    padding: 1rem;
  }
  .header {
    margin-bottom: 3rem;
    border-radius: var(--border-radius-small);
  }
  .title {
    font-weight: var(--font-weight-semibold);
  }
  .description {
    font-family: var(--font-family-monospace);
    margin: 1rem 0;
    white-space: pre-wrap;
  }
</style>

<Layout {baseUrl} {project}>
  <div class="commit">
    <div class="header">
      <span class="title">
        <InlineMarkdown
          stripEmphasizedStyling
          fontSize="large"
          content={header.summary} />
      </span>
      <pre class="description txt-small">{header.description}</pre>
      <CommitAuthorship {header}>
        <span class="global-commit">{formatCommit(header.id)}</span>
      </CommitAuthorship>
    </div>
    <Changeset
      {baseUrl}
      projectId={project.id}
      files={commit.files}
      diff={commit.diff}
      revision={commit.commit.id} />
  </div>
</Layout>
