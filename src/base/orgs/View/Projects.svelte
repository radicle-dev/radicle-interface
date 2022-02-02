<script lang="ts">
  import type { Config } from "@app/config";
  import type { Org } from "@app/base/orgs/Org";
  import type { PendingProject, Project } from "@app/project";
  import Loading from "@app/Loading.svelte";
  import Message from "@app/Message.svelte";
  import Widget from '@app/base/projects/Widget.svelte';
  import Anchor from './Anchor.svelte';
  import { formatCommit } from "@app/utils";

  export let org: Org;
  export let config: Config;
  export let account: string | null;

  const updateRecords = () => {
    getProjects = queryProjects;
  };

  $: queryProjects = async (): Promise<(Project | PendingProject)[]> => {
    if (account) {
      const result = await org.isMember(account, config);
      return result ? org.getAllProjects(config) : org.getProjects(config);
    }
    return org.getProjects(config);
  };
  $: getProjects = queryProjects;
</script>

<style>
  .projects {
    margin-top: 1rem;
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
          <Widget {project} addressOrName={org.address} {config} faded>
            <span slot="stateHash">
              <span class="mobile">commit {formatCommit(project.anchor.stateHash)}</span>
              <span class="desktop">commit {project.anchor.stateHash}</span>
            </span>
            <span class="anchor" slot="actions">
              {#if org.safe && account}
                <Anchor {project} safe={org.safe} on:success={() => updateRecords()} {account} {config} />
              {/if}
            </span>
          </Widget>
        {:else} <!-- Anchored project -->
          <Widget {project} addressOrName={org.address} {config}>
            <span slot="stateHash">
              <span class="mobile">commit {formatCommit(project.anchor.stateHash)}</span>
              <span class="desktop">commit {project.anchor.stateHash}</span>
            </span>
          </Widget>
        {/if}
      </div>
    {/each}
  {:catch err}
    <Message error>
      <strong>Error: </strong> failed to load projects: {err.message}.
    </Message>
  {/await}
</div>
