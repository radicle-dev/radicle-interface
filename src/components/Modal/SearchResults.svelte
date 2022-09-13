<script lang="ts">
  import Modal from "@app/Modal.svelte";
  import { link } from "svelte-routing";
  import { formatRadicleUrn, getSeedEmoji } from "@app/utils";
  import type { Config } from "@app/config";
  import Address from "@app/Address.svelte";
  import Button from "@app/Button.svelte";
  import { createEventDispatcher } from "svelte";
  import type { ResolvedSearch } from "@app/resolver";

  export let query: string;
  export let results: ResolvedSearch;
  export let config: Config;

  const dispatch = createEventDispatcher();
</script>

<style>
  .results {
    text-align: left;
  }
  ul {
    list-style-type: none;
    padding: 0;
  }
  li {
    margin: 0.5rem 0;
  }
  .urn {
    color: var(--color-foreground-5);
  }
</style>

<svelte:window on:click={() => dispatch("close")} />

<Modal center floating>
  <span slot="title">️🔍</span>
  <span slot="subtitle">
    <p class="highlight txt-medium">
      <span class="txt-bold">
        Results for <q>{query}</q>
      </span>
    </p>
  </span>
  <span class="results" slot="body">
    {#if results.projects.length > 0}
      <p class="highlight txt-medium">Projects</p>
      <ul>
        {#each results.projects as project}
          <li>
            <a use:link href="/seeds/{project.seed.host}/{project.info.urn}">
              <span title={project.seed.host}>
                <span>
                  {getSeedEmoji(project.seed.host, config)}&nbsp;{project.info
                    .name}
                </span>
                <span class="urn">
                  &nbsp;{formatRadicleUrn(project.info.urn)}
                </span>
              </span>
            </a>
          </li>
        {/each}
      </ul>
    {/if}
    {#if results.ens.length > 0}
      <p class="highlight txt-medium">ENS names</p>
      <ul>
        {#each results.ens as profile}
          <li>
            <Address address={profile.address} {profile} {config} resolve />
          </li>
        {/each}
      </ul>
    {/if}
  </span>
  <span slot="actions">
    <Button variant="foreground" on:click={() => dispatch("close")}>
      Close
    </Button>
  </span>
</Modal>
