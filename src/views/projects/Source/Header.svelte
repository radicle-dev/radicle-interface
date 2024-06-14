<script lang="ts">
  import type { ProjectRoute } from "../router";
  import type { BaseUrl, Project, Remote, Tree } from "@http-client";

  import { HttpdClient } from "@http-client";

  import Button from "@app/components/Button.svelte";
  import CommitButton from "../components/CommitButton.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Link from "@app/components/Link.svelte";
  import Loading from "@app/components/Loading.svelte";
  import PeerBranchSelector from "./PeerBranchSelector.svelte";

  export let commit: string;
  export let filesLinkActive: boolean;
  export let historyLinkActive: boolean;
  export let node: BaseUrl;
  export let peer: string | undefined;
  export let peers: Remote[];
  export let project: Project;
  export let baseRoute: Extract<
    ProjectRoute,
    { resource: "project.source" } | { resource: "project.history" }
  >;
  export let revision: string | undefined;
  export let tree: Tree;

  const api = new HttpdClient(node);
  let selectedBranch: string | undefined;

  // Revision may be a commit ID, a branch name or `undefined` which means the
  // default branch. We assign `selectedBranch` accordingly.
  $: if (revision === lastCommit.id) {
    selectedBranch = undefined;
  } else {
    selectedBranch = revision || project.defaultBranch;
  }

  $: lastCommit = tree.lastCommit;
</script>

<style>
  .top-header {
    display: flex;
    align-items: center;
    justify-content: left;
    row-gap: 0.5rem;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 2rem;
  }

  .header {
    font-size: var(--font-size-tiny);
    display: flex;
    gap: 0.375rem;
    align-items: center;
    justify-content: left;
    flex-wrap: wrap;
    position: relative;
  }
  .header::after {
    content: "";
    position: absolute;
    left: -1rem;
    bottom: 0;
    border-bottom: 1px solid var(--color-fill-separator);
    width: calc(100% + 1rem);
    z-index: -1;
  }

  .counter {
    border-radius: var(--border-radius-tiny);
    background-color: var(--color-fill-ghost);
    color: var(--color-foreground-dim);
    padding: 0 0.25rem;
  }

  .title-counter {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .selected {
    background-color: var(--color-fill-ghost);
    color: var(--color-foreground-contrast);
  }
</style>

<div class="top-header">
  <PeerBranchSelector
    {peers}
    {peer}
    {baseRoute}
    onCanonical={Boolean(!peer && selectedBranch === project.defaultBranch)}
    {project}
    {selectedBranch} />
  <CommitButton
    styleMinWidth="0"
    styleWidth="100%"
    hideSummaryOnMobile={false}
    projectId={project.id}
    commit={lastCommit}
    baseUrl={node}
    styleRoundBorders />
</div>

<div class="header">
  <div style="display: flex; gap: 0.375rem;">
    <Link
      route={{
        resource: "project.source",
        project: project.id,
        node: node,
        peer,
        revision,
      }}>
      <Button size="large" variant={filesLinkActive ? "tab-active" : "tab"}>
        <IconSmall name="file" />Files
      </Button>
    </Link>

    <Link
      route={{
        resource: "project.history",
        project: project.id,
        node: node,
        peer,
        revision,
      }}>
      <Button size="large" variant={historyLinkActive ? "tab-active" : "tab"}>
        <IconSmall name="commit" />
        <div class="title-counter">
          Commits
          {#await api.project.getTreeStatsBySha(project.id, commit)}
            <Loading small center noDelay grayscale />
          {:then stats}
            <div class="counter" class:selected={historyLinkActive}>
              {stats.commits}
            </div>
          {/await}
        </div>
      </Button>
    </Link>
  </div>
</div>
