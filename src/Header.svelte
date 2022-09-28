<script lang="ts">
  import type { Config } from "@app/config";
  import type { ProjectsAndProfiles } from "@app/Search.svelte";
  import type { Session } from "@app/session";

  import { link } from "svelte-routing";

  import Avatar from "@app/Avatar.svelte";
  import Button from "@app/Button.svelte";
  import Connect from "@app/Connect.svelte";
  import Floating from "@app/Floating.svelte";
  import Icon from "@app/Icon.svelte";
  import Loading from "@app/Loading.svelte";
  import Logo from "@app/Logo.svelte";
  import Search from "@app/Search.svelte";
  import SearchResults from "@app/components/Modal/SearchResults.svelte";
  import SeedDropdown from "@app/SeedDropdown.svelte";
  import ThemeToggle from "@app/ThemeToggle.svelte";

  import { Profile, ProfileType } from "@app/profile";
  import { closeFocused } from "@app/Floating.svelte";
  import { disconnectWallet } from "@app/session";
  import { error, Failure } from "@app/error";
  import { formatAddress, formatBalance } from "@app/utils";

  export let session: Session | null;
  export let config: Config;

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
  .nav {
    display: inline-block;
    height: 100%;
    margin-left: 1.5rem;
    white-space: nowrap;
  }
  .nav .seeds-container {
    display: inline-block;
  }
  .logo {
    display: flex;
    height: var(--button-regular-height);
    align-items: center;
    margin-right: 0.5rem;
  }
  .error {
    text-align: center;
    color: var(--color-negative);
    border: 1px solid var(--color-negative);
    padding: 0.5rem;
  }
  .error a {
    color: var(--color-negative);
    text-decoration: none;
    border-bottom: dotted var(--color-negative) 1px;
  }
  .error a:hover {
    text-decoration: none;
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
    header .nav,
    .register,
    .balance {
      display: none;
    }
  }
  .modal {
    background: var(--color-background);
    border-radius: var(--border-radius);
    max-width: 22.5rem;
    min-width: 18rem;
    padding: 1.5rem;
    position: absolute;
    right: 1.5rem;
    top: 5rem;
  }
  .modal a {
    color: var(--color-foreground-6);
    padding-left: 0.5rem;
  }
  .modal a:hover {
    color: var(--color-foreground);
  }
</style>

{#if $error}
  {#if $error.type === Failure.TransactionFailed}
    <div class="error">
      {#if $error.message}
        <span class="txt-bold">Error:</span>
        {$error.message}
      {:else if $error.txHash}
        <span class="txt-bold">Error:</span>
        Transaction
        <a href="https://etherscan.io/tx/{$error.txHash}">{$error.txHash}</a>
        failed.
      {/if}
    </div>
  {/if}
{/if}

<header>
  <div class="left">
    <a use:link href="/" class="logo"><Logo /></a>
    <div class="search">
      <Search
        {config}
        on:search={e => {
          ({ query, results } = e.detail);
        }} />
    </div>
    <div class="nav">
      {#if session && Object.keys(session.siwe).length > 0}
        <span class="seeds-container">
          <Floating>
            <span slot="toggle">Seeds</span>
            <svelte:fragment slot="modal">
              <SeedDropdown seeds={session.siwe} {config} />
            </svelte:fragment>
          </Floating>
        </span>
      {/if}
    </div>
  </div>

  <div class="right">
    {#if config && config.network.name === "rinkeby"}
      <span class="network">Rinkeby</span>
    {:else if config && config.network.name === "homestead"}
      <!-- Don't show anything -->
    {:else}
      <span class="network unavailable">No Network</span>
    {/if}
    <a use:link class="register" href="/registrations">Register</a>

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
        on:click={() => disconnectWallet(config)}
        on:mouseover={() => (sessionButtonHover = true)}
        on:focus={() => (sessionButtonHover = true)}
        on:mouseout={() => (sessionButtonHover = false)}
        on:blur={() => (sessionButtonHover = false)}>
        {#await Profile.get(address, ProfileType.Minimal, config)}
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
    {:else if config}
      <span class="connect">
        <Connect buttonVariant="foreground" {config} />
      </span>
    {/if}
    <ThemeToggle />
    <div class="mobile">
      <Floating overlay>
        <div slot="toggle">
          <span style="transform: scale(1.2);">
            <Icon name="ellipsis" />
          </span>
        </div>

        <svelte:fragment slot="modal">
          <div class="modal">
            <div style="padding-bottom: 1rem;">
              <Search
                {config}
                on:finished={() => {
                  closeFocused();
                }}
                on:search={e => {
                  ({ query, results } = e.detail);
                }} />
            </div>
            <a
              use:link
              on:click={() => {
                closeFocused();
              }}
              href="/registrations">
              Register
            </a>
          </div>
        </svelte:fragment>
      </Floating>
    </div>
  </div>

  {#if results}
    <SearchResults
      {config}
      {results}
      {query}
      on:close={() => {
        results = null;
      }} />
  {/if}
</header>
