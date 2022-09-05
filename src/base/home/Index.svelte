<script lang="ts">
  import { router } from "tinro";
  import { fade } from "svelte/transition";
  import type { Config } from "@app/config";
  import Loading from "@app/Loading.svelte";
  import Widget from "@app/base/projects/Widget.svelte";
  import { Project, ProjectInfo } from "@app/project";
  import type { Host } from "@app/api";
  import * as proj from "@app/project";
  import Message from "@app/Message.svelte";
  import { setOpenGraphMetaTag } from "@app/utils";

  export let config: Config;

  setOpenGraphMetaTag([
    { prop: "og:title", content: "Radicle Interface" },
    { prop: "og:description", content: "Interact with Radicle" },
    { prop: "og:url", content: window.location.href },
  ]);

  const getProjects =
    config.projects.pinned.length > 0
      ? Project.getMulti(config.projects.pinned)
      : Promise.resolve([]);

  const onClick = (project: ProjectInfo, seed: Host) => {
    router.goto(
      proj.path({
        urn: project.urn,
        seed: seed.host,
        profile: null,
        revision: project.head,
      }),
    );
  };
</script>

<style>
  main {
    padding: 3rem 3rem;
    width: 100%;
    max-width: 74rem;
  }
  .blurb {
    color: var(--color-foreground-90);
    padding: 0rem;
    max-width: 70%;
    font-size: 1.25rem;
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
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }
  .loading {
    padding-top: 2rem;
  }
  @media (max-width: 720px) {
    .blurb {
      max-width: none;
      font-size: 1rem;
    }
    .heading {
      font-size: 1rem;
    }
  }
</style>

<svelte:head>
  <title>Radicle &ndash; Home</title>
</svelte:head>

<main in:fade={{ duration: 200 }}>
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
        Explore <strong>projects</strong>
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
        <strong>Error:</strong>
        failed to load projects.
      </Message>
    </div>
  {/await}
</main>
