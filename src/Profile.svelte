<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import type { Wallet } from "@app/wallet";
  import type { Seed, Stats } from "@app/base/seeds/Seed";
  import type { ProjectInfo } from "@app/project";
  import Address from "@app/Address.svelte";
  import Avatar from "@app/Avatar.svelte";
  import Icon from "@app/Icon.svelte";
  import SetName from "@app/ens/SetName.svelte";
  import SeedAddress from "@app/SeedAddress.svelte";
  import { Profile, ProfileType } from "@app/profile";
  import Loading from "@app/Loading.svelte";
  import * as utils from "@app/utils";
  import { session } from "@app/session";
  import ErrorModal from "@app/ErrorModal.svelte";
  import { User } from "@app/base/users/User";
  import Projects from "@app/base/seeds/View/Projects.svelte";
  import { MissingReverseRecord, NotFoundError } from "@app/error";
  import NotFound from "@app/NotFound.svelte";
  import RadicleUrn from "@app/RadicleUrn.svelte";
  import Async from "@app/Async.svelte";
  import Badge from "@app/Badge.svelte";
  import Button from "@app/Button.svelte";
  import { defaultLinkPort } from "@app/base/seeds/Seed";
  import * as router from "@app/router";

  export let wallet: Wallet;
  export let addressOrName: string;
  export let action: string | null = null;

  let setNameForm: typeof SvelteComponent | null =
    action === "setName" ? SetName : null;
  const setName = () => {
    setNameForm = SetName;
  };

  const getProjectsAndStats = async (
    seed: Seed,
    id?: string,
  ): Promise<{
    stats: Stats;
    projects: ProjectInfo[];
  }> => {
    const stats = await seed.getStats();
    const projects = await seed.getProjects(10, id);
    return { stats, projects };
  };

  $: isUserAuthorized = (address: string): boolean | null => {
    return $session && utils.isAddressEqual(address, $session.address);
  };
</script>

<style>
  main {
    padding: 5rem 0;
    width: 720px;
  }
  main > header {
    display: flex;
    align-items: center;
    justify-content: left;
    margin-bottom: 2rem;
  }
  main > header > * {
    margin: 0 1rem 0 0;
  }
  .info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: left;
  }
  .info a {
    border: none;
  }
  .fields {
    display: grid;
    grid-template-columns: 5rem 4fr 2fr;
    grid-gap: 1rem 2rem;
    margin-bottom: 1rem;
  }
  .fields > div {
    justify-self: start;
    align-self: center;
    height: 2rem;
    line-height: 2rem;
  }
  .avatar {
    width: 64px;
    height: 64px;
  }
  .title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .links {
    display: flex;
    align-items: center;
    justify-content: left;
  }
  .overflow-text {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .url {
    display: flex; /* Ensures correct vertical positioning of icons */
    margin-right: 0.5rem;
    height: 1.6rem;
    align-items: center;
  }
  @media (max-width: 720px) {
    main {
      width: 100%;
      padding: 1.5rem;
    }
    .fields {
      grid-template-columns: 5rem auto;
    }
  }
</style>

<svelte:head>
  <title>{addressOrName}</title>
</svelte:head>

{#await Profile.get(addressOrName, ProfileType.Full, wallet)}
  <div class="layout-centered">
    <Loading center />
  </div>
{:then profile}
  <main>
    <header>
      <div class="avatar">
        <Avatar
          source={profile.avatar ?? profile.address}
          title={profile.address} />
      </div>
      <div class="info">
        <span class="title txt-title">
          <span class="txt-bold layout-desktop">
            {profile.name
              ? utils.formatName(profile.name, wallet)
              : profile.address}
          </span>
          <span class="txt-bold layout-mobile">
            {profile.name
              ? utils.formatName(profile.name, wallet)
              : utils.formatAddress(profile.address)}
          </span>
          {#if profile.name && profile.org}
            <Badge variant="foreground">org</Badge>
          {/if}
        </span>
        <div class="links">
          {#if profile.url}
            <a class="url" href={profile.url}>
              <span class="layout-mobile">
                <Icon name="url" />
              </span>
              <span class="layout-desktop" style="margin-right: 0.3rem;">
                {profile.url}
              </span>
            </a>
          {/if}
          {#if profile.twitter}
            <a class="url" href="https://twitter.com/{profile.twitter}">
              <Icon name="twitter" />
            </a>
          {/if}
          {#if profile.github}
            <a class="url" href="https://github.com/{profile.github}">
              <Icon name="github" />
            </a>
          {/if}
        </div>
      </div>
    </header>

    <div class="fields">
      <!-- ID -->
      {#if profile.id}
        <div class="txt-highlight">ID</div>
        <RadicleUrn urn={profile.id} />
      {/if}
      <!-- Seed Address -->
      {#if profile.seed && profile.seed.valid}
        <div class="txt-highlight">Seed</div>
        <SeedAddress seed={profile.seed} port={defaultLinkPort} />
      {/if}
      <!-- Address -->
      <div class="txt-highlight">Address</div>
      <div class="layout-desktop">
        <Address {wallet} {profile} address={profile.address} />
      </div>
      <div class="layout-mobile">
        <Address compact {wallet} {profile} address={profile.address} />
      </div>
      <div class="layout-desktop" />
      <!-- Owner -->
      {#if profile.org}
        <div class="txt-highlight">Owner</div>
        <div class="layout-desktop">
          <Address resolve {wallet} address={profile.org.owner} />
        </div>
        <div class="layout-mobile">
          <Address compact resolve {wallet} address={profile.org.owner} />
        </div>
        <div class="layout-desktop" />
      {/if}
      <!-- Org Name/Profile -->
      <div class="txt-highlight">Profile</div>
      {#if profile.org}
        {#if utils.isAddressEqual(profile.address, profile.org.address)}
          <div class="overflow-text">
            {#if profile.name && profile.ens}
              <!-- svelte-ignore a11y-invalid-attribute -->
              <a
                use:router.link={{
                  type: "registration",
                  params: {
                    activeView: {
                      type: "view",
                      params: { nameOrDomain: profile.ens.name, retry: false },
                    },
                  },
                }}
                href=""
                class="txt-link">
                {profile.name}
              </a>
            {:else}
              <span class="txt-missing">Not set</span>
            {/if}
          </div>
        {/if}
      {:else}
        <!-- User Profile -->
        <div>
          {#if profile.name && profile.ens}
            <!-- svelte-ignore a11y-invalid-attribute -->
            <a
              use:router.link={{
                type: "registration",
                params: {
                  activeView: {
                    type: "view",
                    params: { nameOrDomain: profile.ens.name, retry: false },
                  },
                },
              }}
              href=""
              class="txt-link">
              {profile.name}
            </a>
          {:else}
            <span class="txt-missing">Not set</span>
          {/if}
        </div>
        <div class="layout-desktop">
          {#if isUserAuthorized(profile.address) && !profile.org}
            <Button variant="secondary" size="small" on:click={setName}>
              Set
            </Button>
          {/if}
        </div>
      {/if}
    </div>

    {#if profile.seed?.valid}
      <Async fetch={getProjectsAndStats(profile.seed, profile.id)} let:result>
        <Projects
          {profile}
          seed={profile.seed}
          stats={result.stats}
          projects={result.projects} />
      </Async>
    {/if}
  </main>

  <svelte:component
    this={setNameForm}
    entity={new User(profile.address)}
    {wallet}
    on:close={() => (setNameForm = null)} />
{:catch err}
  {#if err instanceof NotFoundError}
    <NotFound
      title={addressOrName}
      subtitle="Sorry, the requested address or domain was not found." />
  {:else if err instanceof MissingReverseRecord}
    <NotFound
      title={addressOrName}
      subtitle="Sorry, the requested name has no reverse record set." />
  {:else}
    <ErrorModal error={err} />
  {/if}
{/await}
