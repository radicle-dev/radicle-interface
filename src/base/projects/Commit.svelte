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

  const { org, user, peer, seed } = source;

  const navigateCommit = (path: string, content?: proj.ProjectContent) => {
    // Replaces path with current path if none passed.
    if (path === undefined) path = "/";

    if (org) {
      navigate(proj.path({ content, peer, urn, org, revision, path }));
    } else if (user) {
      navigate(proj.path({ content, peer, urn, user, revision, path }));
    } else if (seed) {
      navigate(proj.path({ content, peer, urn, seed, revision, path }));
    } else {
      navigate(proj.path({ content, peer, urn, revision, path }));
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
    align-items: flex-start;
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
        <div class="desktop font-mono faded">
          <span>commit</span>
          <span>{commit.header.sha1}</span>
        </div>
        <div class="mobile font-mono faded">
          {formatCommit(commit.header.sha1)}
        </div>
      </div>
      <pre>{commit.header.description}</pre>
      <div>
        <span>Committed by {commit.header.committer.name}</span>
        <span class="font-mono faded desktop-inline">&lt;{commit.header.committer.email}&gt; </span>
        <span class="desktop-inline">{formatCommitTime(commit.header.committerTime)}</span>
      </div>
      <div>
        <span>Authored by {commit.header.author.name} </span>
        <span class="font-mono faded desktop-inline">&lt;{commit.header.author.email}&gt;</span>
      </div>
    </header>
    <Changeset stats={commit.stats} diff={commit.diff} on:browse={(event) => navigateCommit(event.detail)} />
  </div>
{:catch err}
  <div class="commit">
    <div class="error error-message text-xsmall">
      <div>API request to <code class="text-xsmall">{err.url}</code> failed.</div>
      <div>API needs to be version ^0.2.</div>
    </div>
  </div>
{/await}
