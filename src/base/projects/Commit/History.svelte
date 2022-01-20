<script lang="ts">
  import CommitTeaser from "./CommitTeaser.svelte";
  import { getCommits, Source, getOid, ProjectContent, splitPrefixFromPath } from "@app/project";
  import Loading from "@app/Loading.svelte";
  import { groupCommitHistory, GroupedCommitsHistory } from "./lib";

  export let source: Source;
  export let locator: string;
  export let content: ProjectContent;
  export let revision: string;

  let { urn, config, project, branches } = source;

  // Bind content to commit history to trigger updates in parent components.
  $: [revision_,] = splitPrefixFromPath(locator, branches, project.head);
  $: content = ProjectContent.History;
  $: revision = revision_;

  async function fetchCommits(revision: string): Promise<GroupedCommitsHistory> {
    const commitsQuery = await getCommits(urn, getOid(project.head, revision, branches), config);
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
    padding: 0.25rem 0;
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
            <div class="commit">
              <CommitTeaser {commit} />
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
      <div>API needs to be version ^0.2.</div>
    </div>
  </div>
{/await}
