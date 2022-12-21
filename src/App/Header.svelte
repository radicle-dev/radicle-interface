<script lang="ts">
  import type { Wallet } from "@app/lib/wallet";
  import type { ProjectsAndProfiles } from "./Header/Search.svelte";
  import type { Session } from "@app/lib/session";

  import Avatar from "@app/components/Avatar.svelte";
  import Button from "@app/components/Button.svelte";
  import Connect from "@app/components/Connect.svelte";
  import Floating from "@app/components/Floating.svelte";
  import Icon from "@app/components/Icon.svelte";
  import Link from "@app/components/Link.svelte";
  import Loading from "@app/components/Loading.svelte";
  import SettingsDropdown from "./Header/SettingsDropdown.svelte";

  import Logo from "./Header/Logo.svelte";
  import Search from "./Header/Search.svelte";
  import SearchResults from "./Header/SearchResults.svelte";

  import { Profile, ProfileType } from "@app/lib/profile";
  import { closeFocused } from "@app/components/Floating.svelte";
  import { disconnectWallet } from "@app/lib/session";
  import { formatAddress, formatBalance } from "@app/lib/utils";

  export let session: Session | null;
  export let wallet: Wallet;

  let query: string;
  let results: ProjectsAndProfiles | null = null;

  let sessionButtonHover = false;

  $: address = session && session.address;
  $: tokenBalance = session && session.tokenBalance;
</script>

<style>
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0;
    padding: 1.5rem;
    height: 5.5rem;
  }
  .left,
  .right {
    display: flex;
    align-items: center;
    height: var(--button-regular-height);
    gap: 1rem;
  }
  .logo {
    display: flex;
    height: var(--button-regular-height);
    align-items: center;
    margin-right: 0.5rem;
  }
  .search {
    width: 16rem;
  }
  .connect {
    display: inline-block;
  }
  .network {
    color: var(--color-tertiary-6);
    background-color: var(--color-tertiary-1);
    line-height: 1.5em;
    padding: 0rem 1rem;
    height: var(--button-regular-height);
    display: flex;
    align-items: center;
    border-radius: var(--border-radius-round);
  }
  .network:hover {
    background-color: var(--color-tertiary-3);
  }
  .network.unavailable {
    color: var(--color-foreground-5);
    background-color: var(--color-foreground-3);
  }
  .network:last-child {
    margin-right: 0;
  }
  .register {
    display: inline-block;
    padding: 0.5rem 0.5rem;
    cursor: pointer;
    user-select: none;
    color: var(--color-foreground);
  }
  .register:hover {
    color: var(--color-foreground);
  }
  .balance {
    white-space: nowrap;
  }

  @media (max-width: 720px) {
    header .right {
      gap: 1rem;
    }
    .network,
    .search,
    .register,
    .balance {
      display: none;
    }
  }
  .modal {
    background: var(--color-background);
    border-radius: var(--border-radius);
    box-shadow: var(--elevation-low);
    max-width: 22.5rem;
    min-width: 18rem;
    padding: 1.5rem;
    position: absolute;
    right: 1.5rem;
    top: 5rem;
  }
  .modal-register {
    color: var(--color-foreground);
    padding-left: 0.5rem;
  }
  .modal-register:hover {
    color: var(--color-foreground);
  }

  .toggle {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: var(--border-radius-round);
    border: 1px solid var(--color-foreground);
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    color: var(--color-foreground);
  }
  .toggle:hover {
    background-color: var(--color-foreground);
    color: var(--color-background);
  }
</style>

<header>
  <div class="left">
    <Link route={{ resource: "home" }}><span class="logo"><Logo /></span></Link>
    <div class="search">
      <Search
        {wallet}
        on:search={e => {
          ({ query, results } = e.detail);
        }} />
    </div>
  </div>

  <div class="right">
    {#if wallet && wallet.network.name === "goerli"}
      <Link
        route={{
          resource: "faucet",
          params: { view: { resource: "form" } },
        }}>
        <span class="network">Goerli</span>
      </Link>
    {:else if wallet && wallet.network.name === "homestead"}
      <!-- Don't show anything -->
    {:else}
      <span class="network unavailable">No Network</span>
    {/if}
    <Link
      route={{
        resource: "registrations",
        params: { view: { resource: "validateName" } },
      }}>
      <span class="register">Register</span>
    </Link>

    {#if address}
      <span class="balance">
        {#if tokenBalance}
          {formatBalance(tokenBalance)}
          <span class="txt-bold">RAD</span>
        {:else}
          <Loading small />
        {/if}
      </span>

      <Button
        style="width: 10rem; white-space: nowrap;"
        variant="foreground"
        on:click={() => disconnectWallet(wallet)}
        on:mouseover={() => (sessionButtonHover = true)}
        on:focus={() => (sessionButtonHover = true)}
        on:mouseout={() => (sessionButtonHover = false)}
        on:blur={() => (sessionButtonHover = false)}>
        {#await Profile.get(address, ProfileType.Minimal, wallet)}
          <Loading small center />
        {:then profile}
          {#if sessionButtonHover}
            Disconnect
          {:else}
            <Avatar
              source={profile.avatar ?? address}
              title={address}
              inline />{formatAddress(address)}
          {/if}
        {/await}
      </Button>
    {:else if wallet}
      <span class="connect">
        <Connect buttonVariant="foreground" {wallet} />
      </span>
    {/if}
    <Floating>
      <div slot="toggle">
        <button class="toggle" name="Settings">
          <Icon name="gear" />
        </button>
      </div>
      <SettingsDropdown slot="modal" />
    </Floating>
    <div class="layout-mobile">
      <Floating>
        <div slot="toggle">
          <span style="transform: scale(1.2);">
            <Icon name="ellipsis" />
          </span>
        </div>

        <svelte:fragment slot="modal">
          <div class="modal">
            <div style="padding-bottom: 1rem;">
              <Search
                {wallet}
                on:finished={() => {
                  closeFocused();
                }}
                on:search={e => {
                  ({ query, results } = e.detail);
                }} />
            </div>
            <Link
              route={{
                resource: "registrations",
                params: { view: { resource: "validateName" } },
              }}
              on:click={() => {
                closeFocused();
              }}>
              <span class="modal-register">Register</span>
            </Link>
          </div>
        </svelte:fragment>
      </Floating>
    </div>
  </div>

  {#if results}
    <SearchResults
      {wallet}
      {results}
      {query}
      on:close={() => {
        results = null;
      }} />
  {/if}
</header>
