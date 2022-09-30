<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import type { Config } from "@app/config";
  import type { Seed, Stats } from "@app/base/seeds/Seed";
  import type { ProjectInfo } from "@app/project";
  import Address from "@app/Address.svelte";
  import Avatar from "@app/Avatar.svelte";
  import Icon from "@app/Icon.svelte";
  import SetName from "@app/ens/SetName.svelte";
  import SeedAddress from "@app/SeedAddress.svelte";
  import TransferOwnership from "@app/components/TransferOwnership.svelte";
  import Link from "@app/Link.svelte";
  import { getBalance, Profile, ProfileType } from "@app/profile";
  import Loading from "@app/Loading.svelte";
  import * as utils from "@app/utils";
  import { session } from "@app/session";
  import { Org } from "@app/base/orgs/Org";
  import Message from "@app/Message.svelte";
  import Error from "@app/Error.svelte";
  import { User } from "@app/base/users/User";
  import Projects from "@app/base/seeds/View/Projects.svelte";
  import { MissingReverseRecord, NotFoundError } from "@app/error";
  import NotFound from "@app/NotFound.svelte";
  import RadicleUrn from "@app/RadicleUrn.svelte";
  import Async from "@app/Async.svelte";
  import Badge from "@app/Badge.svelte";
  import Button from "@app/Button.svelte";

  export let config: Config;
  export let addressOrName: string;
  export let action: string | null = null;

  let setNameForm: typeof SvelteComponent | null =
    action === "setName" ? SetName : null;
  const setName = () => {
    setNameForm = SetName;
  };

  let transferOwnerForm: typeof SvelteComponent | null = null;
  const transferOwnership = () => {
    transferOwnerForm = TransferOwnership;
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

  $: account = $session && $session.address;
  $: isOwner = (org: Org): boolean =>
    $session ? utils.isAddressEqual(org.owner, $session.address) : false;
  $: getOrgTreasury = async (
    org: Org,
  ): Promise<Array<utils.Token> | undefined> => {
    const addressType = await utils.identifyAddress(org.owner, config);
    // We query the org treasury only for Gnosis Safes, to maintain some privacy for EOA org owners.
    if (addressType === utils.AddressType.Safe) {
      try {
        const tokens = await utils.getTokens(org.owner, config);
        const balance = await getBalance(org.owner, config);

        if (!balance.isZero()) {
          // To maintain the format we hardcode the ETH specs.
          return [
            {
              balance,
              decimals: 18,
              logo: "",
              name: "Ethereum",
              symbol: "ETH",
            },
            ...tokens,
          ];
        } else {
          return tokens;
        }
      } catch (e) {
        console.error(e);
      }
    }
  };
  $: isUserAuthorized = (address: string): boolean | null => {
    return $session && utils.isAddressEqual(address, $session.address);
  };
  $: isOrgAuthorized = async (org: Org): Promise<boolean> => {
    if ($session) {
      if (isOwner(org)) {
        return true;
      }
      return await org.isMember($session.address, config);
    }
    return false;
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
  .members {
    margin-top: 2rem;
    align-items: center;
    display: flex;
    flex-wrap: wrap;
  }
  .members.loading {
    padding-bottom: 1rem;
  }
  .members .member {
    display: flex;
    align-items: center;
    margin-right: 2rem;
    margin-bottom: 1rem;
  }
  .members .member:last-child {
    margin-right: 0;
  }
  .members .member-icon {
    width: 2rem;
    height: 2rem;
    margin-right: 1rem;
  }
  @media (max-width: 720px) {
    main {
      width: 100%;
      padding: 1.5rem;
    }
    .fields {
      grid-template-columns: 5rem auto;
    }
    .members .member {
      margin-right: 1rem;
    }
  }
</style>

<svelte:head>
  <title>{addressOrName}</title>
</svelte:head>

{#await Profile.get(addressOrName, ProfileType.Full, config)}
  <div class="off-centered">
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
          <span class="txt-bold desktop">
            {profile.name
              ? utils.formatName(profile.name, config)
              : profile.address}
          </span>
          <span class="txt-bold mobile">
            {profile.name
              ? utils.formatName(profile.name, config)
              : utils.formatAddress(profile.address)}
          </span>
          {#if profile.name && profile.org}
            <Badge variant="foreground">org</Badge>
          {/if}
        </span>
        <div class="links">
          {#if profile.url}
            <a class="url" href={profile.url}>
              <span class="mobile">
                <Icon name="url" />
              </span>
              <span class="desktop" style="margin-right: 0.3rem;">
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
        <div class="label">ID</div>
        <RadicleUrn urn={profile.id} />
      {/if}
      <!-- Seed Address -->
      {#if profile.seed && profile.seed.valid}
        <div class="label">Seed</div>
        <SeedAddress seed={profile.seed} port={config.seed.link.port} />
      {/if}
      <!-- Address -->
      <div class="label">Address</div>
      <div class="desktop">
        <Address {config} {profile} address={profile.address} />
      </div>
      <div class="mobile">
        <Address compact {config} {profile} address={profile.address} />
      </div>
      <div class="desktop" />
      <!-- Owner -->
      {#if profile.org}
        <div class="label">Owner</div>
        <div class="desktop">
          <Address resolve {config} address={profile.org.owner} />
        </div>
        <div class="mobile">
          <Address compact resolve {config} address={profile.org.owner} />
        </div>
        <div class="desktop">
          {#await account && profile.org.isMember(account, config) then isMember}
            {#if isOwner(profile.org) || isMember}
              <Button
                variant="secondary"
                size="small"
                on:click={transferOwnership}>
                Transfer
              </Button>
            {/if}
          {/await}
        </div>
        <!-- Org Treasury -->
        {#await getOrgTreasury(profile.org) then tokens}
          {#if tokens && tokens.length > 0}
            <div class="label">Treasury</div>
            <div>
              {#each tokens as token}
                {` ${utils.formatBalance(token.balance, token.decimals)} ${
                  token.symbol
                } `}
              {/each}
            </div>
            <div class="desktop" />
          {/if}
        {/await}
      {:else}
        <!-- Project anchors -->
        {#if profile.anchorsAccount}
          <div class="label">Anchors</div>
          <div class="desktop">
            <Address {config} address={profile.anchorsAccount} />
          </div>
          <div class="mobile">
            <Address compact {config} address={profile.anchorsAccount} />
          </div>
          <div class="desktop" />
        {/if}
      {/if}
      <!-- Org Name/Profile -->
      <div class="label">Profile</div>
      {#if profile.org}
        {#if utils.isAddressEqual(profile.address, profile.org.address)}
          <div class="overflow-text">
            {#if profile.name}
              <a href={profile.registry(config)} class="link">{profile.name}</a>
            {:else}
              <span class="txt-missing">Not set</span>
            {/if}
          </div>
          <div class="desktop">
            {#await isOrgAuthorized(profile.org)}
              <!-- Loading -->
            {:then authorized}
              {#if authorized}
                <Button variant="secondary" size="small" on:click={setName}>
                  Set
                </Button>
              {/if}
            {/await}
          </div>
        {/if}
        <!-- Quorum -->
        {#await profile.org.getSafe(config) then safe}
          {#if safe}
            <div class="label">Quorum</div>
            <div>
              {safe.threshold}
              <span class="faded">of</span>
              {safe.owners.length}
            </div>
            <div class="desktop" />
          {/if}
        {/await}
      {:else}
        <!-- User Profile -->
        <div>
          {#if profile.name}
            <a href={profile.registry(config)} class="link">{profile.name}</a>
          {:else}
            <span class="txt-missing">Not set</span>
          {/if}
        </div>
        <div class="desktop">
          {#if isUserAuthorized(profile.address)}
            <Button variant="secondary" size="small" on:click={setName}>
              Set
            </Button>
          {/if}
        </div>
      {/if}
    </div>

    {#if profile.org}
      {#await profile.org.getMembers(config)}
        <Loading center />
      {:then members}
        {#if members.length > 0}
          <!-- We don't need to catch errors here, since it's not defined by user input and defaults to ETH addresses -->
          {#await Profile.getMulti(members, config)}
            <div class="members loading">
              <Loading small />
            </div>
          {:then members}
            <div class="members">
              {#each members as profile}
                <div class="member">
                  <div class="member-icon">
                    <Link to="/{profile.address}">
                      <Avatar
                        source={profile.avatar ?? profile.address}
                        title={profile.address} />
                    </Link>
                  </div>
                  <div class="desktop">
                    <Address
                      address={profile.address}
                      compact
                      resolve
                      noBadge
                      noAvatar
                      {profile}
                      {config} />
                  </div>
                </div>
              {/each}
            </div>
          {/await}
        {/if}
      {:catch err}
        <Message error>
          <span class="txt-bold">Error:</span>
          failed to load org members: {err.message}.
        </Message>
      {/await}
    {:else}
      {#await Org.getOrgsByMember(profile.address, config)}
        <Loading center />
      {:then orgs}
        {#if orgs.length > 0}
          <div class="members">
            {#each orgs as org}
              <div class="member">
                <!-- We don't need to catch errors here, since it's not defined by user input and defaults to ETH addresses -->
                {#await Profile.get(org.address, ProfileType.Minimal, config)}
                  <Loading small margins />
                {:then profile}
                  <div class="member-icon">
                    <Link to="/{profile.address}">
                      <Avatar
                        source={profile.avatar ?? profile.address}
                        title={profile.address} />
                    </Link>
                  </div>
                  <div class="desktop">
                    <Address
                      address={profile.address}
                      compact
                      resolve
                      noBadge
                      noAvatar
                      {profile}
                      {config} />
                  </div>
                {/await}
              </div>
            {/each}
          </div>
        {/if}
      {:catch err}
        <Message error>
          <span class="txt-bold">Error:</span>
          failed to load orgs: {err.message}.
        </Message>
      {/await}
    {/if}
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
    entity={profile.org ?? new User(profile.address)}
    {config}
    on:close={() => (setNameForm = null)} />
  <svelte:component
    this={transferOwnerForm}
    org={profile.org}
    {config}
    on:close={() => (transferOwnerForm = null)} />
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
    <Error error={err} />
  {/if}
{/await}
