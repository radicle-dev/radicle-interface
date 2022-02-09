<script lang="ts">
  import * as proj from "@app/project";
  import Changeset from "@app/base/projects/SourceBrowser/Changeset.svelte";
  import { navigate } from "svelte-routing";
  import { formatCommitTime } from "@app/commit";
  import { formatCommit } from "@app/utils";

  export let content: proj.ProjectContent;
  export let revision: string;
  export let locator: string;
  export let source: any;

  const { addressOrName, peer, seed } = source;

  const navigateCommit = (path: string, content?: proj.ProjectContent) => {
    // Replaces path with current path if none passed.
    if (path === undefined) path = "/";

    if (addressOrName) {
      navigate(proj.path({ content, peer, urn, addressOrName, revision, path }));
    } else {
      navigate(proj.path({ content, peer, urn, seed: seed.host, revision, path }));
    }
  };

  let { project, urn, branches, config } = source;

  $: [revision_,] = proj.splitPrefixFromPath(locator, branches, project.head);
  $: content = proj.ProjectContent.Commit;
  $: revision = revision_;
</script>

<style>
  .commit {
    padding: 0 2rem 0 8rem;
    font-size: 0.875rem;
  }
  h3 {
    margin: 0;
  }
  header {
    padding: 1rem;
    background: var(--color-foreground-background-subtle);
    border-radius: 0.5rem;
  }
  .summary {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  .description {
    margin: 0.5rem 0 1rem 0;
  }
  .meta {
    color: var(--color-foreground-80);
  }
  .email {
    font-family: var(--font-family-monospace);
    font-size: 0.875rem;
  }
  .sha1 {
    color: var(--color-foreground-80);
    font-size: 0.875rem;
  }
  .time {
    margin-left: 0.25rem;
    color: var(--color-foreground-faded);
  }
  @media (max-width: 960px) {
    .commit {
      padding-left: 2rem;
    }
  }
</style>

{#await proj.getCommit(urn, revision, config) then commit}
  <div class="commit">
    <header>
      <div class="summary">
        <h3>{commit.header.summary}</h3>
        <div class="desktop font-mono sha1">
          <span>{commit.header.sha1}</span>
        </div>
        <div class="mobile font-mono sha1">
          {formatCommit(commit.header.sha1)}
        </div>
      </div>
      <pre class="description">{commit.header.description}</pre>
      <div class="meta">
        <span>Committed by <strong>{commit.header.committer.name}</strong></span>
        <span class="font-mono email desktop-inline">&lt;{commit.header.committer.email}&gt; </span>
        <span class="time desktop-inline">{formatCommitTime(commit.header.committerTime)}</span>
      </div>
      <div class="meta">
        <span>Authored by <strong>{commit.header.author.name}</strong> </span>
        <span class="font-mono email desktop-inline">&lt;{commit.header.author.email}&gt;</span>
      </div>
    </header>
    <Changeset stats={commit.stats} diff={commit.diff} on:browse={(event) => navigateCommit(event.detail)} />
  </div>
{:catch err}
  <div class="commit">
    <div class="error error-message text-xsmall">
      <div>API request to <code class="text-xsmall">{err.url}</code> failed.</div>
    </div>
  </div>
{/await}
