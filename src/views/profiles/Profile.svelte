<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import type { Seed, Stats } from "@app/lib/seed";
  import type { ProjectInfo } from "@app/lib/project";
  import type { VestingInfo } from "@app/lib/vesting";

  import * as utils from "@app/lib/utils";
  import Address from "@app/components/Address.svelte";
  import Async from "@app/components/Async.svelte";
  import Avatar from "@app/components/Avatar.svelte";
  import Badge from "@app/components/Badge.svelte";
  import Button from "@app/components/Button.svelte";
  import ErrorModal from "@app/components/ErrorModal.svelte";
  import Icon from "@app/components/Icon.svelte";
  import Link from "@app/components/Link.svelte";
  import Loading from "@app/components/Loading.svelte";
  import NotFound from "@app/components/NotFound.svelte";
  import Projects from "@app/views/seeds/View/Projects.svelte";
  import RadicleId from "@app/components/RadicleId.svelte";
  import SeedAddress from "@app/components/SeedAddress.svelte";
  import SetName from "./SetName.svelte";
  import Withdraw from "@app/views/vesting/Withdraw.svelte";
  import ethereumContractAbis from "@app/lib/ethereum/contractAbis.json";
  import { MissingReverseRecord, NotFoundError } from "@app/lib/error";
  import { User, Profile, ProfileType } from "@app/lib/profile";
  import { defaultNodePort } from "@app/lib/seed";
  import { ethers } from "ethers";
  import {
    getInfo,
    handleEtherErrorState,
    parseVestingPeriods,
  } from "@app/lib/vesting";
  import { onMount } from "svelte";
  import { providerStore, sessionStore } from "@app/lib/session";

  export let addressOrName: string;

  let vestingInfo: VestingInfo | undefined = undefined;
  let setNameForm: typeof SvelteComponent | undefined = undefined;
  let withdrawVestingModal: typeof SvelteComponent | undefined = undefined;
  const setName = () => {
    setNameForm = SetName;
  };
  const withdrawVesting = () => {
    withdrawVestingModal = Withdraw;
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

  // Refresh vestingInfo and close modal if addressOrName changes
  $: {
    vestingInfo = undefined;
    withdrawVestingModal = undefined;
    getInfo(addressOrName)
      .then(info => {
        vestingInfo = info;
      })
      .catch(() => {
        console.warn("Not able to get vesting contract info");
      });
  }

  onMount(async () => {
    const addressType = await utils.identifyAddress(addressOrName);
    if (addressType === utils.AddressType.Contract) {
      try {
        vestingInfo = await getInfo(addressOrName);
      } catch (e) {
        handleEtherErrorState(e, "Not able to get vesting contract info");
      }
    }
  });

  const vestingContract = new ethers.Contract(
    addressOrName,
    ethereumContractAbis.vesting,
    $providerStore,
  );

  $providerStore.on("block", async () => {
    if (vestingInfo) {
      try {
        const updatedAmounts = await Promise.all([
          vestingContract.withdrawableBalance(),
          vestingContract.withdrawn(),
        ]);
        vestingInfo.withdrawableBalance = utils.formatBalance(
          updatedAmounts[0],
        );
        vestingInfo.withdrawn = utils.formatBalance(updatedAmounts[1]);
      } catch (e) {
        handleEtherErrorState(e, "Not able to update the balance");
      }
    }
  });

  $: isUserAuthorized = (address: string): boolean | null => {
    return utils.isAddressEqual(address, $sessionStore?.address || "");
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
    grid-template-columns: max-content 4fr 2fr;
    gap: 1rem 2rem;
    margin-bottom: 1rem;
  }
  .fields > div {
    place-self: center start;
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
      grid-template-columns: max-content auto;
    }
  }
</style>

<svelte:head>
  <title>{addressOrName}</title>
</svelte:head>

{#await Profile.get(addressOrName, ProfileType.Full)}
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
          <span class="txt-bold">
            {profile.name
              ? utils.formatName(profile.name)
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
          {#if utils.isAddress(profile.address)}
            <a
              class="url"
              title="Lookup address on Etherscan"
              href={utils.explorerLink(profile.address)}>
              <Icon name="etherscan" />
            </a>
          {/if}
        </div>
      </div>
    </header>

    <div class="fields">
      <!-- ID -->
      {#if profile.id}
        <div class="txt-highlight">ID</div>
        <RadicleId id={profile.id} />
      {/if}
      <!-- Seed Address -->
      {#if profile.seed && profile.seed.valid}
        <div class="txt-highlight">Seed</div>
        <SeedAddress seed={profile.seed} port={defaultNodePort} />
      {/if}
      <!-- Address -->
      <div class="txt-highlight">Address</div>
      <div class="layout-desktop">
        <Address {profile} address={profile.address} />
      </div>
      <div class="layout-mobile">
        <Address compact {profile} address={profile.address} />
      </div>
      <div class="layout-desktop" />
      <!-- Owner -->
      {#if profile.org}
        <div class="txt-highlight">Owner</div>
        <div class="layout-desktop">
          <Address resolve address={profile.org.owner} />
        </div>
        <div class="layout-mobile">
          <Address compact resolve address={profile.org.owner} />
        </div>
        <div class="layout-desktop" />
      {/if}
      <!-- Org Name/Profile -->
      <div class="txt-highlight">Profile</div>
      {#if profile.org}
        {#if utils.isAddressEqual(profile.address, profile.org.address)}
          <div class="overflow-text">
            {#if profile.name && profile.ens}
              <Link
                route={{
                  resource: "registrations",
                  params: {
                    view: {
                      resource: "view",
                      params: { nameOrDomain: profile.ens.name, retry: false },
                    },
                  },
                }}>
                <span class="txt-link">{profile.name}</span>
              </Link>
            {:else}
              <span class="txt-missing">Not set</span>
            {/if}
          </div>
        {/if}
      {:else}
        <!-- User Profile -->
        <div>
          {#if profile.name && profile.ens}
            <Link
              route={{
                resource: "registrations",
                params: {
                  view: {
                    resource: "view",
                    params: { nameOrDomain: profile.ens.name, retry: false },
                  },
                },
              }}>
              <span class="txt-link">{profile.name}</span>
            </Link>
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
      {#if vestingInfo}
        <div class="txt-highlight">Vesting Beneficiary</div>
        <div style:display="flex" style:gap="1rem">
          <Address address={vestingInfo.beneficiary} resolve compact />
        </div>
        <div class="layout-desktop" />
        <div class="txt-highlight">Allocation</div>
        <div>
          {vestingInfo.totalVesting}
          <span class="txt-bold">{vestingInfo.symbol}</span>
        </div>
        <div class="layout-desktop" />
        <div class="txt-highlight">Withdrawn</div>
        <div>
          {vestingInfo.withdrawn}
          <span class="txt-bold">{vestingInfo.symbol}</span>
        </div>
        <div class="layout-desktop" />
        <div class="txt-highlight">Withdrawable</div>
        <div>
          {vestingInfo.withdrawableBalance}
          <span class="txt-bold">{vestingInfo.symbol}</span>
        </div>
        <div class="layout-desktop">
          {#if isUserAuthorized(vestingInfo.beneficiary) && parseFloat(vestingInfo.withdrawableBalance) > 0}
            <Button variant="secondary" size="small" on:click={withdrawVesting}>
              Withdraw
            </Button>
          {/if}
        </div>
        <div class="txt-highlight">Start Time</div>
        <div>
          <span>
            {parseVestingPeriods(vestingInfo.vestingStartTime)}
          </span>
        </div>
        <div class="layout-desktop" />
        <div class="txt-highlight">Cliff Period End</div>
        <div>
          <span>
            {parseVestingPeriods(
              vestingInfo.vestingStartTime,
              vestingInfo.cliffPeriod,
            )}
          </span>
        </div>
        <div class="layout-desktop" />
        <div class="txt-highlight">Vesting Period End</div>
        <div>
          <span>
            {parseVestingPeriods(
              vestingInfo.vestingStartTime,
              vestingInfo.vestingPeriod,
            )}
          </span>
        </div>
        <div class="layout-desktop" />
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
    this={withdrawVestingModal}
    info={vestingInfo}
    contractAddress={addressOrName}
    on:close={() => (withdrawVestingModal = undefined)} />

  <svelte:component
    this={setNameForm}
    entity={new User(profile.address)}
    on:close={() => (setNameForm = undefined)} />
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
