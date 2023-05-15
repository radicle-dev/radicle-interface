<script lang="ts">
  import type { BaseUrl } from "@httpd-client";
  import type { ProjectRoute } from "@app/views/projects/router";

  import { config } from "@app/lib/config";
  import { pluralize } from "@app/lib/pluralize";

  import CloneButton from "@app/views/projects/CloneButton.svelte";
  import Link from "@app/components/Link.svelte";
  import ProjectLink from "@app/components/ProjectLink.svelte";
  import SquareButton from "@app/components/SquareButton.svelte";

  export let activeRoute: ProjectRoute;
  export let baseUrl: BaseUrl;

  export let projectId: string;
  export let projectName: string;

  export let openPatchCount: number;
  export let openIssueCount: number;
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

  .header:last-of-type {
    margin-bottom: 2rem;
  }

  @media (max-width: 960px) {
    .header {
      padding-left: 2rem;
    }
    .header {
      margin-bottom: 1.5rem;
    }
  }
</style>

<div class="header">
  <ProjectLink
    projectParams={{
      view: { resource: "tree" },
      path: "/",
      peer: undefined,
      route: undefined,
      revision: undefined,
    }}>
    <SquareButton
      active={activeRoute.params.view.resource === "tree" ||
        activeRoute.params.view.resource === "history" ||
        activeRoute.params.view.resource === "commits"}>
      Source
    </SquareButton>
  </ProjectLink>
  <ProjectLink
    projectParams={{
      id: projectId,
      view: {
        resource: "issues",
      },
      peer: undefined,
      search: undefined,
      revision: undefined,
      path: undefined,
    }}>
    <SquareButton active={activeRoute.params.view.resource === "issues"}>
      <span class="txt-bold">{openIssueCount}</span>
      {pluralize("issue", openIssueCount)}
    </SquareButton>
  </ProjectLink>

  <ProjectLink
    projectParams={{
      id: projectId,
      view: {
        resource: "patches",
      },
      peer: undefined,
      search: undefined,
      revision: undefined,
      path: undefined,
    }}>
    <SquareButton active={activeRoute.params.view.resource === "patches"}>
      <span class="txt-bold">{openPatchCount}</span>
      {pluralize("patch", openPatchCount)}
    </SquareButton>
  </ProjectLink>
  <CloneButton {baseUrl} id={projectId} name={projectName} />

  <Link
    route={{
      resource: "seeds",
      params: {
        hostnamePort:
          baseUrl.port === config.seeds.defaultHttpdPort
            ? baseUrl.hostname
            : `${baseUrl.hostname}:${baseUrl.port}`,
        projectPageIndex: 0,
      },
    }}>
    <SquareButton>
      {baseUrl.hostname}
    </SquareButton>
  </Link>
</div>
