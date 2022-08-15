<script lang="ts">
  import { Project, ProjectContent } from "@app/project";
  import type { Config } from "@app/config";
  import IssueTeaser from "@app/base/projects/Issue/IssueTeaser.svelte";
  import IssueFilter from "@app/base/projects/Issue/IssueFilter.svelte";
  import type { Issue } from "@app/issue";

  export let project: Project;
  export let config: Config;
  export let issues: Issue[];

  const navigate = (issue: string) => {
    project.navigateTo({
      content: ProjectContent.Issue,
      issue,
      patch: null,
      revision: null,
      path: null
    });
  };
</script>

<style>
  .issues {
    padding: 0 2rem 0 8rem;
    font-size: 0.875rem;
  }
  .issues-list {
    border-radius: var(--border-radius);
    overflow: hidden;
  }
  .teaser:not(:last-child) {
    border-bottom: 1px dashed var(--color-background);
  }

  @media (max-width: 960px) {
    .issues {
      padding-left: 2rem;
    }
  }
</style>

<div class="issues">
  <IssueFilter {issues} let:filteredIssues>
  {@const sortedIssues = filteredIssues.sort(({ timestamp: t1 }, { timestamp: t2 }) => t2 - t1)}
    <div class="issues-list">
      {#each sortedIssues as issue}
        <div class="teaser" on:click={() => navigate(issue.id)}>
          <IssueTeaser {config} {issue} />
        </div>
      {/each}
    </div>
  </IssueFilter>
</div>
