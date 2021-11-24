<script lang="ts">
  import type { Config } from "@app/config";
  import type { Org } from "@app/base/orgs/Org";
  import type { PendingProject, Project } from "@app/project";
  import { session } from '@app/session';
  import Loading from "@app/Loading.svelte";
  import Message from "@app/Message.svelte";
  import Widget from '@app/base/projects/Widget.svelte';
  import Anchor from './Anchor.svelte';

  export let org: Org;
  export let config: Config;

  let getProjects = queryProjects;

  function updateRecords() {
    getProjects = queryProjects;
  }

  async function queryProjects(): Promise<(Project | PendingProject)[]> {
    if ($session) {
      const result = await org.isMember($session.address, config);
      return result ? org.getAllProjects(config) : org.getProjects(config);
    }
    return org.getProjects(config);
  }
</script>

<style>
  .projects {
    margin-top: 2rem;
  }
  .projects .project {
    margin-bottom: 1rem;
  }
  .anchor {
    display: flex;
    align-items: center;
  }
</style>

<div class="projects">
  {#await getProjects()}
    <Loading center />
  {:then projects}
    {#each projects as project}
      <div class="project">
        {#if "safeTxHash" in project} <!-- Pending project -->
          <Widget {project} org={org.address} {config} faded>
            <span class="anchor" slot="actions">
              {#if org.safe && $session}
                <Anchor {project} safe={org.safe} on:success={() => updateRecords()} account={$session.address} {config} />
                <button on:click={() => updateRecords()}>Update projects</button>
              {/if}
            </span>
          </Widget>
        {:else} <!-- Anchored project -->
          <Widget {project} org={org.address} {config} />
        {/if}
      </div>
    {/each}
  {:catch err}
    <Message error>
      <strong>Error: </strong> failed to load projects: {err.message}.
    </Message>
  {/await}
</div>
