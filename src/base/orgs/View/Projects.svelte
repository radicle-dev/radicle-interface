<script lang="ts">
  import type { Config } from "@app/config";
  import { Org } from "@app/base/orgs/Org";
  import type * as proj from "@app/project";
  import Loading from "@app/Loading.svelte";
  import Message from "@app/Message.svelte";
  import Widget from '@app/base/projects/Widget.svelte';
  import Anchor from './Anchor.svelte';
  import { formatCommit } from "@app/utils";
  import type { Profile } from "@app/profile";

  export let profile: Profile;
  export let config: Config;
  export let account: string | null;

  const updateRecords = () => {
    getProjects = queryProjects;
  };

  $: queryProjects = async (): Promise<(proj.Project | proj.PendingProject)[]> => {
    if (profile.org) {
      if (account) {
        const result = await profile.org.isMember(account, config);
        return result ? profile.org.getAllProjects(config) : profile.org.getProjects(config);
      }
    }
    return [];
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
  {#if profile.org}
    {#await getProjects()}
      <Loading center />
    {:then projects}
      {#each projects as project}
        <div class="project">
          {#if "safeTxHash" in project} <!-- Pending project -->
            <Widget {project} addressOrName={profile.org.name ?? profile.org.address} {config} faded>
              <span slot="stateHash">
                <span class="mobile">commit {formatCommit(project.anchor.stateHash)}</span>
                <span class="desktop">commit {project.anchor.stateHash}</span>
              </span>
              <span class="anchor" slot="actions">
                {#if profile.org.safe && account}
                  <Anchor {project} safe={profile.org.safe} on:success={() => updateRecords()} {account} {config} />
                {/if}
              </span>
            </Widget>
          {:else} <!-- Anchored project -->
            <Widget {project} addressOrName={profile.org.name ?? profile.org.address} {config}>
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
        <strong>Error: </strong> failed to load anchored projects: {err.message}.
      </Message>
    {/await}
  {:else}
    <div class="projects">
      {#if profile.anchorsAccount}
        {#await Org.get(profile.anchorsAccount, config)}
          <Loading center fadeIn />
        {:then org}
          {#if org}
            {#await org.getProjects(config) then projects}
              {#each projects as project}
                <div class="project">
                  <Widget {project} addressOrName={profile.address} {config}>
                    <span slot="stateHash">
                      <span class="mobile">commit {formatCommit(project.anchor.stateHash)}</span>
                      <span class="desktop">commit {project.anchor.stateHash}</span>
                    </span>
                  </Widget>
                </div>
              {/each}
            {:catch err}
              <Message error>
                <strong>Error: </strong> failed to load projects: {err.message}.
              </Message>
            {/await}
          {/if}
        {/await}
      {/if}
    </div>
  {/if}
</div>
