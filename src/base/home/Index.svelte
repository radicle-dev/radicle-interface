<script lang="ts" context="module">
  export type LoadedRoute = {
    type: "home";
  };
</script>

<script lang="ts">
  import { navigate } from "@app/router";
  import type { Config } from "@app/config";
  import Loading from "@app/Loading.svelte";
  import Widget from "@app/base/projects/Widget.svelte";
  import type { ProjectInfo } from "@app/project";
  import { Project } from "@app/project";
  import type { Host } from "@app/api";
  import Message from "@app/Message.svelte";
  import { setOpenGraphMetaTag } from "@app/utils";
  import type { Content } from "../projects/route";

  export let config: Config;

  setOpenGraphMetaTag([
    { prop: "og:title", content: "Radicle Interface" },
    { prop: "og:description", content: "Interact with Radicle" },
    { prop: "og:url", content: window.location.href },
  ]);

  const getProjects =
    config.projects.pinned.length > 0
      ? Project.getMulti(
          config.projects.pinned.map(project => ({
            nameOrUrn: project.urn,
            seed: project.seed,
          })),
        )
      : Promise.resolve([]);

  const onClick = (project: ProjectInfo, seed: Host) => {
    navigate({
      type: "projects",
      params: {
        urn: project.urn,
        seedHost: seed.host,
        activeView: {
          type: "tree",
          restRoute: "",
        },
      },
    });
  };
</script>

<style>
  main {
    padding: 3rem 3rem;
    width: 100%;
    max-width: 74rem;
  }
  .blurb {
    color: var(--color-foreground);
    padding: 0rem;
    max-width: 70%;
    font-size: var(--font-size-medium);
    text-align: left;
    border-radius: var(--border-radius);
    margin-bottom: 1.5rem;
  }
  .projects {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 1rem;
    width: 100%;
  }
  .project {
    width: 16rem;
  }
  .heading {
    color: var(--color-secondary);
    padding: 1rem 0rem;
    font-size: var(--font-size-medium);
    margin-bottom: 1rem;
  }
  .loading {
    padding-top: 2rem;
  }
  @media (max-width: 720px) {
    .blurb {
      max-width: none;
      font-size: var(--font-size-regular);
    }
    .heading {
      font-size: var(--font-size-regular);
    }
  }
</style>

<svelte:head>
  <title>Radicle &ndash; Home</title>
</svelte:head>

<main>
  <div class="blurb">
    <p>
      Radicle 🌱 enables developers 🧙 to securely collaborate 🔐 on software
      over a peer-to-peer network 🌐 built on Git.
    </p>
  </div>

  {#await getProjects}
    <div class="loading">
      <Loading center />
    </div>
  {:then results}
    {#if results.length}
      <div class="heading">
        Explore <span class="txt-bold">projects</span>
        on the Radicle network.
      </div>

      <div class="projects">
        {#each results as result}
          <div class="project">
            <Widget
              compact
              project={result.info}
              seed={{ api: result.seed }}
              on:click={() => onClick(result.info, result.seed)} />
          </div>
        {/each}
      </div>
    {/if}
  {:catch}
    <div class="padding">
      <Message error>
        <span class="txt-bold">Error:</span>
        failed to load projects.
      </Message>
    </div>
  {/await}
</main>
