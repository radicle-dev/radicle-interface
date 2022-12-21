<script lang="ts">
  import type { Host } from "@app/lib/api";
  import type { ProjectInfo } from "@app/lib/project";

  import * as router from "@app/lib/router";
  import Loading from "@app/components/Loading.svelte";
  import Message from "@app/components/Message.svelte";
  import Widget from "@app/views/projects/Widget.svelte";
  import { config } from "@app/lib/config";
  import { Project } from "@app/lib/project";
  import { setOpenGraphMetaTag, twemoji } from "@app/lib/utils";

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

  function onClick(project: ProjectInfo, seed: Host) {
    router.push({
      resource: "projects",
      params: {
        view: { resource: "tree" },
        urn: project.urn,
        peer: undefined,
        seed: seed.host,
        profile: undefined,
        revision: project.head ?? undefined,
      },
    });
  }
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
    <p use:twemoji>
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
