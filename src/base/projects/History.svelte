<script lang="ts">
  import CommitTeaser from "./Commit/CommitTeaser.svelte";
  import { getCommits, Source, getOid, ProjectContent, splitPrefixFromPath } from "@app/project";
  import * as proj from "@app/project";
  import Loading from "@app/Loading.svelte";
  import { groupCommitHistory, GroupedCommitsHistory } from "@app/commit";
  import { navigate } from "svelte-routing";

  export let source: Source;
  export let locator: string;
  export let content: ProjectContent;
  export let revision: string;
  export let path: string;
  export let peer: string;

  let { urn, seed, addressOrName, project, branches } = source;

  // Bind content to commit history to trigger updates in parent components.
  $: [revision_,] = splitPrefixFromPath(locator, branches, project.head);
  $: content = ProjectContent.History;
  $: revision = revision_;

  const navigateHistory = (revision: string, content?: ProjectContent) => {
    // Replaces path with current path if none passed.
    if (! path) path = "/";

    if (addressOrName) {
      navigate(proj.path({ content, peer, urn, addressOrName, revision, path }));
    } else {
      navigate(proj.path({ content, peer, urn, seed: seed.host, revision, path }));
    }
  };

  async function fetchCommits(revision: string): Promise<GroupedCommitsHistory> {
    const commitsQuery = await getCommits(urn, getOid(project.head, revision, branches), seed.api);
    return groupCommitHistory(commitsQuery);
  }
</script>

<style>
  .history {
    padding: 0 2rem 0 8rem;
    font-size: 0.875rem;
  }
  .commit-group header {
    color: var(--color-foreground-faded);
  }
  .commit-group-headers {
    border-radius: 0.25rem;
    margin-bottom: 2rem;
    background: var(--color-foreground-background);
  }
  .commit {
    cursor: pointer;
  }
  .commit:first-child {
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
  }
  .commit:last-child {
    border-bottom-left-radius: 0.25rem;
    border-bottom-right-radius: 0.25rem;
  }
  .commit:hover {
    background: var(--color-foreground-background-lighter);
  }
  @media (max-width: 960px) {
    .history {
      padding-left: 2rem;
    }
  }
</style>

{#await fetchCommits(revision)}
  <Loading center />
{:then history}
  <div class="history">
    {#each history.headers as group (group.time)}
      <div class="commit-group">
        <header>
          <p>{group.time}</p>
        </header>
        <div class="commit-group-headers">
          {#each group.commits as commit (commit.sha1)}
            <div class="commit" on:click={() => navigateHistory(commit.sha1, ProjectContent.Commit)}>
              <CommitTeaser {commit} on:browseCommit={(event) => navigateHistory(event.detail)} />
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
{:catch err}
  <div class="history">
    <div class="error error-message text-xsmall">
      <div>API request to <code class="text-xsmall">{err.url}</code> failed.</div>
    </div>
  </div>
{/await}
