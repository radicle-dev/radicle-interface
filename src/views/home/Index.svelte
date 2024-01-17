<script lang="ts">
  import type { ProjectBaseUrlActivity } from "./router";

  import { isLocal, twemoji } from "@app/lib/utils";

  import AppLayout from "@app/App/AppLayout.svelte";
  import Link from "@app/components/Link.svelte";
  import ProjectCard from "@app/components/ProjectCard.svelte";

  export let projects: ProjectBaseUrlActivity[];
</script>

<style>
  .wrapper {
    padding: 3rem 16vw;
    width: 100%;
  }
  .blurb {
    color: var(--color-foreground-contrast);
    padding: 0rem;
    font-size: var(--font-size-medium);
    text-align: left;
    margin-bottom: 1.5rem;
  }
  .projects {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 2.5rem;
    width: 100%;
  }
  .project {
    width: 16rem;
  }
  .heading {
    color: var(--color-foreground-emphasized);
    padding: 1rem 0rem;
    font-size: var(--font-size-medium);
    margin-bottom: 1rem;
  }

  @media (max-width: 720px) {
    .project {
      width: 100%;
    }
    .projects {
      margin-bottom: 1.5rem;
      gap: 1.5rem;
    }
    .wrapper {
      width: 100%;
      padding: 1rem 1.5rem 0 1.5rem;
    }
  }
</style>

<AppLayout>
  <div class="wrapper">
    <div class="blurb">
      <p use:twemoji>
        Radicle 🌱 enables developers 🧙 to securely collaborate 🔐 on software
        <br class="global-hide-on-mobile" />
        over a peer-to-peer network 🌐 built on Git.
      </p>
    </div>

    {#if projects.length > 0}
      <div class="heading">
        {#if isLocal(projects[0].baseUrl.hostname)}
          <!-- prettier-ignore -->
          <span>Explore projects on your <span class="txt-bold">local node</span>.</span>
        {:else}
          <!-- prettier-ignore -->
          <span>Explore projects on the <span class="txt-bold">Radicle network</span>.</span>
        {/if}
      </div>

      <div class="projects">
        {#each projects as { project, baseUrl, activity }}
          <div class="project">
            <Link
              route={{
                resource: "project.source",
                project: project.id,
                node: baseUrl,
              }}>
              <ProjectCard
                compact
                description={project.description}
                head={project.head}
                visibility={project.visibility?.type}
                id={project.id}
                name={project.name}
                {activity} />
            </Link>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</AppLayout>
