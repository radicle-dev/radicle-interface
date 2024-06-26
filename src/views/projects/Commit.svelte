<script lang="ts">
  import type { BaseUrl, Commit, Project, SeedingPolicy } from "@http-client";

  import Button from "@app/components/Button.svelte";
  import Changeset from "@app/views/projects/Changeset.svelte";
  import CommitAuthorship from "@app/views/projects/Commit/CommitAuthorship.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import InlineTitle from "@app/views/projects/components/InlineTitle.svelte";
  import Layout from "./Layout.svelte";
  import Link from "@app/components/Link.svelte";
  import Share from "./Share.svelte";
  import Id from "@app/components/Id.svelte";

  export let baseUrl: BaseUrl;
  export let seedingPolicy: SeedingPolicy;
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

<Layout {seedingPolicy} {baseUrl} {project}>
  <div class="commit">
    <div class="header">
      <div style="display:flex; flex-direction: column; gap: 0.5rem;">
        <span class="title">
          <InlineTitle fontSize="large" content={header.summary} />
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
          <Id id={header.id} style="commit" ariaLabel="commit-id" />
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
