<script lang="ts">
  import type { BaseUrl, Project, Remote, Tree } from "@httpd-client";
  import type { ProjectRoute } from "@app/lib/router/definitions";

  import * as router from "@app/lib/router";

  import { closeFocused } from "@app/components/Floating.svelte";
  import { config } from "@app/lib/config";
  import { pluralize } from "@app/lib/pluralize";

  import BranchSelector from "@app/views/projects/BranchSelector.svelte";
  import CloneButton from "@app/views/projects/CloneButton.svelte";
  import HeaderToggleLabel from "@app/views/projects/HeaderToggleLabel.svelte";
  import PeerSelector from "@app/views/projects/PeerSelector.svelte";

  export let project: Project;
  export let activeRoute: ProjectRoute;
  export let tree: Tree;
  export let commit: string;
  export let peers: Remote[];
  export let branches: Record<string, string>;
  export let baseUrl: BaseUrl;

  $: revision = activeRoute.params.revision ?? commit;

  // Switches between project views.
  const toggleContent = (
    input: "issues" | "patches" | "history",
    keepSourceInPath: boolean,
  ) => {
    router.updateProjectRoute({
      view: {
        resource: activeRoute.params.view.resource === input ? "tree" : input,
      },
      id: project.id,
      revision: revision,
      search: undefined,
      ...(keepSourceInPath ? null : { revision: undefined, path: undefined }),
    });
  };

  const updatePeer = (peer: string) => {
    router.updateProjectRoute({
      peer,
      revision: undefined,
    });
    closeFocused();
  };

  const updateRevision = (revision: string) => {
    router.updateProjectRoute({
      revision,
    });
    closeFocused();
  };

  function goToSeed() {
    if (baseUrl.port !== config.seeds.defaultHttpdPort) {
      router.push({
        resource: "seeds",
        params: { hostnamePort: `${baseUrl.hostname}:${baseUrl.port}` },
      });
    } else {
      router.push({
        resource: "seeds",
        params: { hostnamePort: baseUrl.hostname },
      });
    }
  }
</script>

<style>
  header {
    font-size: var(--font-size-tiny);
    padding: 0 2rem 0 8rem;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    justify-content: left;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  @media (max-width: 960px) {
    header {
      padding-left: 2rem;
    }
    header {
      margin-bottom: 1.5rem;
    }
  }
</style>

<header>
  {#if peers.length > 0}
    <PeerSelector
      {peers}
      peer={activeRoute.params.peer}
      on:peerChanged={event => updatePeer(event.detail)} />
  {/if}

  <BranchSelector
    projectDefaultBranch={project.defaultBranch}
    projectHead={project.head}
    {branches}
    {revision}
    on:branchChanged={event => updateRevision(event.detail)} />

  <CloneButton {baseUrl} id={project.id} name={project.name} />

  <span>
    <HeaderToggleLabel
      clickable
      ariaLabel="Seed"
      title="Project data is fetched from this seed"
      on:click={goToSeed}>
      <span>{baseUrl.hostname}</span>
    </HeaderToggleLabel>
  </span>
  <HeaderToggleLabel
    ariaLabel="Commit count"
    clickable
    active={activeRoute.params.view.resource === "history"}
    on:click={() => toggleContent("history", true)}>
    <span class="txt-bold">{tree.stats.commits}</span>
    {pluralize("commit", tree.stats.commits)}
  </HeaderToggleLabel>
  <HeaderToggleLabel
    ariaLabel="Issue count"
    active={activeRoute.params.view.resource === "issues"}
    clickable
    on:click={() => toggleContent("issues", false)}>
    <span class="txt-bold">{project.issues.open}</span>
    {pluralize("issue", project.issues.open)}
  </HeaderToggleLabel>
  <HeaderToggleLabel
    ariaLabel="Patch count"
    active={activeRoute.params.view.resource === "patches"}
    clickable
    on:click={() => toggleContent("patches", false)}>
    <span class="txt-bold">{project.patches.open}</span>
    {pluralize("patch", project.patches.open)}
  </HeaderToggleLabel>
  <HeaderToggleLabel ariaLabel="Contributor count">
    <span class="txt-bold">{tree.stats.contributors}</span>
    {pluralize("contributor", tree.stats.contributors)}
  </HeaderToggleLabel>
</header>
