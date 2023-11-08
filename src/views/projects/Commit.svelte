<script lang="ts">
  import type { BaseUrl, Commit, Project } from "@httpd-client";

  import { formatCommit } from "@app/lib/utils";

  import Changeset from "@app/views/projects/Changeset.svelte";
  import CommitAuthorship from "@app/views/projects/Commit/CommitAuthorship.svelte";
  import InlineMarkdown from "@app/components/InlineMarkdown.svelte";
  import Layout from "./Layout.svelte";
  import CopyableId from "@app/components/CopyableId.svelte";

  export let baseUrl: BaseUrl;
  export let commit: Commit;
  export let project: Project;
  export let tracking: boolean;

  $: header = commit.commit;
</script>

<style>
  .header {
    margin-bottom: 3rem;
    border: 1px solid var(--color-border-hint);
    padding: 1.5rem;
    border-radius: var(--border-radius-small);
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
    color: var(--color-fill-secondary);
    font-size: var(--font-size-small);
  }
</style>

<Layout {baseUrl} {project} {tracking}>
  <div class="header">
    <div class="summary">
      <div class="txt-medium txt-bold">
        <InlineMarkdown fontSize="medium" content={header.summary} />
      </div>
      <div class="layout-desktop-flex txt-monospace sha1">
        <CopyableId id={header.id} />
      </div>
      <div class="layout-mobile-flex txt-monospace sha1 txt-small">
        <CopyableId id={header.id}>
          {formatCommit(header.id)}
        </CopyableId>
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
</Layout>
