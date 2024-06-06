<script lang="ts">
  import type { BaseUrl, Commit, Node, Project } from "@http-client";

  import { formatCommit } from "@app/lib/utils";

  import Button from "@app/components/Button.svelte";
  import Changeset from "@app/views/projects/Changeset.svelte";
  import CommitAuthorship from "@app/views/projects/Commit/CommitAuthorship.svelte";
  import CopyableId from "@app/components/CopyableId.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import InlineMarkdown from "@app/components/InlineMarkdown.svelte";
  import Layout from "./Layout.svelte";
  import Link from "@app/components/Link.svelte";
  import Share from "./Share.svelte";

  export let baseUrl: BaseUrl;
  export let node: Node;
  export let commit: Commit;
  export let project: Project;

  $: header = commit.commit;
</script>

<style>
  .commit {
    background-color: var(--color-background-float);
  }
  .header {
    padding: 1rem;
    border-radius: var(--border-radius-small);
    border-bottom: 1px solid var(--color-border-hint);
  }
  .title {
    display: flex;
    align-items: center;
    font-weight: var(--font-weight-semibold);
  }
  .description {
    font-family: var(--font-family-monospace);
    white-space: pre-wrap;
    margin-top: 1.5rem;
  }
  .button-container {
    margin-left: auto;
    display: flex;
    gap: 0.5rem;
  }
</style>

<Layout {node} {baseUrl} {project}>
  <div class="commit">
    <div class="header">
      <div style="display:flex; flex-direction: column; gap: 0.5rem;">
        <span class="title">
          <InlineMarkdown
            stripEmphasizedStyling
            fontSize="large"
            content={header.summary} />
          <div class="button-container">
            <Link
              route={{
                resource: "project.source",
                project: project.id,
                node: baseUrl,
                path: "/",
                revision: commit.commit.id,
              }}>
              <Button variant="outline" title="Browse repo at this commit">
                <IconSmall name="chevron-left-right" />
              </Button>
            </Link>
            <Share {baseUrl} />
          </div>
        </span>
        <CommitAuthorship {header}>
          <CopyableId id={header.id} style="commit">
            {formatCommit(header.id)}
          </CopyableId>
        </CommitAuthorship>
      </div>
      {#if header.description}
        <pre class="description txt-small">{header.description}</pre>
      {/if}
    </div>
    <Changeset
      {baseUrl}
      projectId={project.id}
      files={commit.files}
      diff={commit.diff}
      revision={commit.commit.id} />
  </div>
</Layout>
