<script lang="ts" strictEvents>
  import Modal from "@app/components/Modal.svelte";
  import { formatRadicleUrn, getSeedEmoji, twemoji } from "@app/lib/utils";
  import type { Wallet } from "@app/lib/wallet";
  import Address from "@app/components/Address.svelte";
  import Button from "@app/components/Button.svelte";
  import { createEventDispatcher } from "svelte";
  import type { ProjectsAndProfiles } from "./Search.svelte";
  import Link from "@app/components/Link.svelte";

  export let query: string;
  export let results: ProjectsAndProfiles;
  export let wallet: Wallet;

  const dispatch = createEventDispatcher<{ close: never }>();
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
  <span slot="title" use:twemoji>️🔍</span>
  <span slot="subtitle">
    <p class="txt-highlight txt-medium">
      <span class="txt-bold">
        Results for <q>{query}</q>
      </span>
    </p>
  </span>
  <span class="results" slot="body">
    {#if results.projects.length > 0}
      <p class="txt-highlight txt-medium">Projects</p>
      <ul>
        {#each results.projects as project}
          <li>
            <Link
              route={{
                resource: "projects",
                params: {
                  view: { resource: "tree" },
                  seed: project.seed.host,
                  urn: project.info.urn,
                },
              }}>
              <span title={project.seed.host}>
                <span>
                  {getSeedEmoji(project.seed.host)}&nbsp;{project.info.name}
                </span>
                <span class="urn">
                  &nbsp;{formatRadicleUrn(project.info.urn)}
                </span>
              </span>
            </Link>
          </li>
        {/each}
      </ul>
    {/if}
    {#if results.profiles.length > 0}
      <p class="txt-highlight txt-medium">ENS names</p>
      <ul>
        {#each results.profiles as profile}
          <li>
            <Address address={profile.address} {profile} {wallet} resolve />
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
