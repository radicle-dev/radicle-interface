<script lang="ts">
  import type { BaseUrl, Project } from "@httpd-client";
  import type { ProjectLoadedView } from "@app/views/projects/router";

  import { unreachable } from "@app/lib/utils";

  import Browser from "./Browser.svelte";
  import Commit from "./Commit.svelte";
  import History from "./History.svelte";
  import Issue from "./Issue.svelte";
  import Issues from "./Issues.svelte";
  import NewIssue from "./Issue/New.svelte";
  import Patch from "./Patch.svelte";
  import Patches from "./Patches.svelte";

  export let baseUrl: BaseUrl;
  export let project: Project;
  export let view: ProjectLoadedView;
</script>

{#if view.resource === "tree"}
  <Browser {...view} {baseUrl} {project} />
{:else if view.resource === "history"}
  <History {...view} {baseUrl} {project} />
{:else if view.resource === "commit"}
  <Commit {...view} {baseUrl} {project} />
{:else if view.resource === "issues"}
  <Issues {...view} {baseUrl} {project} />
{:else if view.resource === "newIssue"}
  <NewIssue {...view} {baseUrl} {project} />
{:else if view.resource === "issue"}
  <Issue {...view} {baseUrl} {project} />
{:else if view.resource === "patches"}
  <Patches {...view} {baseUrl} {project} />
{:else if view.resource === "patch"}
  <Patch {...view} {baseUrl} {project} />
{:else}
  {unreachable(view)}
{/if}
