<script lang="ts" strictEvents>
  import type { Wallet } from "@app/lib/wallet";
  import type { ProjectsAndProfiles } from "@app/lib/search";

  import Address from "@app/components/Address.svelte";
  import Link from "@app/components/Link.svelte";
  import Modal from "@app/components/Modal.svelte";
  import { formatRadicleId, getSeedEmoji } from "@app/lib/utils";
  import * as modal from "@app/lib/modal";

  export let query: string;
  export let results: ProjectsAndProfiles;
  export let wallet: Wallet;
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
  .id {
    color: var(--color-foreground-5);
  }
</style>

<Modal emoji="🔍" title={`Results for "${query}"`}>
  <span slot="body" class="results">
    {#if results.projects.length > 0}
      <div class="txt-highlight txt-medium">Projects</div>
      <ul>
        {#each results.projects as project}
          <li>
            <Link
              on:click={modal.hide}
              route={{
                resource: "projects",
                params: {
                  view: { resource: "tree" },
                  seed: project.seed.host,
                  id: project.info.id,
                },
              }}>
              <span title={project.seed.host}>
                <span>
                  {getSeedEmoji(project.seed.host)}&nbsp;{project.info.name}
                </span>
                <span class="id">
                  &nbsp;{formatRadicleId(project.info.id)}
                </span>
              </span>
            </Link>
          </li>
        {/each}
      </ul>
    {/if}
    {#if results.profiles.length > 0}
      <div class="txt-highlight txt-medium">ENS names</div>
      <ul>
        {#each results.profiles as profile}
          <li>
            <Address address={profile.address} {profile} {wallet} resolve />
          </li>
        {/each}
      </ul>
    {/if}
  </span>
</Modal>
