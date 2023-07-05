<script lang="ts">
  import type { BaseUrl } from "@httpd-client";
  import type { ProjectLoadedView } from "@app/views/projects/router";

  import { isLocal } from "@app/lib/utils";
  import { pluralize } from "@app/lib/pluralize";

  import CloneButton from "@app/views/projects/CloneButton.svelte";
  import Icon from "@app/components/Icon.svelte";
  import Link from "@app/components/Link.svelte";
  import SquareButton from "@app/components/SquareButton.svelte";

  export let resource: ProjectLoadedView["resource"];
  export let baseUrl: BaseUrl;

  export let projectId: string;
  export let projectName: string;

  export let openPatchCount: number;
  export let openIssueCount: number;
  export let trackings: number;
</script>

<style>
  .header {
    font-size: var(--font-size-tiny);
    padding: 0 2rem 0 8rem;
    display: flex;
    align-items: center;
    justify-content: left;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  @media (max-width: 960px) {
    .header {
      padding-left: 2rem;
    }
  }
</style>

<div class="header">
  <Link
    route={{
      resource: "projects",
      params: {
        id: projectId,
        baseUrl,
        view: { resource: "tree" },
        path: "/",
      },
    }}>
    <SquareButton
      active={resource === "tree" ||
        resource === "history" ||
        resource === "commits"}>
      <svelte:fragment slot="icon">
        <Icon size="small" name="chevron-left-right" />
      </svelte:fragment>
      Source
    </SquareButton>
  </Link>
  <Link
    route={{
      resource: "projects",
      params: {
        id: projectId,
        baseUrl,
        view: {
          resource: "issues",
          params: { view: { resource: "list" } },
        },
      },
    }}>
    <SquareButton active={resource === "issues" || resource === "issue"}>
      <svelte:fragment slot="icon">
        <Icon size="small" name="exclamation-circle" />
      </svelte:fragment>
      <span class="txt-bold">{openIssueCount}</span>
      {pluralize("issue", openIssueCount)}
    </SquareButton>
  </Link>

  <Link
    route={{
      resource: "projects",
      params: {
        id: projectId,
        baseUrl,
        view: {
          resource: "patches",
          params: { view: { resource: "list" } },
        },
      },
    }}>
    <SquareButton active={resource === "patches" || resource === "patch"}>
      <svelte:fragment slot="icon">
        <Icon size="small" name="patch" />
      </svelte:fragment>
      <span class="txt-bold">{openPatchCount}</span>
      {pluralize("patch", openPatchCount)}
    </SquareButton>
  </Link>
  <CloneButton {baseUrl} id={projectId} name={projectName} />

  <Link
    route={{
      resource: "seeds",
      params: {
        baseUrl,
        projectPageIndex: 0,
      },
    }}>
    <SquareButton>
      {isLocal(baseUrl.hostname) ? "radicle.local" : baseUrl.hostname}
    </SquareButton>
  </Link>
  <SquareButton hoverable={false} title="Tracked by {trackings} nodes">
    <svelte:fragment slot="icon">
      <Icon size="small" name="network" />
    </svelte:fragment>
    <span class="txt-bold">{trackings}</span>
    nodes
  </SquareButton>
</div>
