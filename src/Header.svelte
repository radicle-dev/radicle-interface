<script lang="ts">
  import { link } from "svelte-routing";
  import { formatAddress, formatBalance } from "@app/utils";
  import { error, Failure } from "@app/error";
  import { disconnectWallet } from "@app/session";
  import type { Session } from "@app/session";
  import Loading from "@app/Loading.svelte";
  import Logo from "@app/Logo.svelte";
  import Connect from "@app/Connect.svelte";
  import type { Config } from "@app/config";
  import { Profile, ProfileType } from "@app/profile";
  import Avatar from "@app/Avatar.svelte";
  import Search from "@app/Search.svelte";
  import Floating from "@app/Floating.svelte";
  import Icon from "./Icon.svelte";
  import MobileNavbar from "./MobileNavbar.svelte";
  import SeedDropdown from "./SeedDropdown.svelte";
  import Button from "@app/Button.svelte";
  import ThemeToggle from "./ThemeToggle.svelte";

  export let session: Session | null;
  export let config: Config;

  let sessionButtonHover = false;
  let mobileNavbarDisplayed = false;

  function toggleNavbar() {
    mobileNavbarDisplayed = !mobileNavbarDisplayed;
  }

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
    height: var(--button-regular-height);
    width: 16rem;
    margin-left: 0.5rem;
    display: inline-block;
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

  div.toggle {
    display: none;
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
    div.toggle {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 42px;
      width: 42px;
      z-index: 2;
      cursor: pointer;
    }
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
      <Search />
    </div>
    <div class="nav">
      {#if session && Object.keys(session.siwe).length > 0}
        <span class="seeds-container">
          <Floating>
            <span slot="toggle" class="nav-link">Seeds</span>
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
    <div class="toggle" on:click={toggleNavbar}>
      <span style="transform: scale(1.2);">
        <Icon name="ellipsis" />
      </span>
    </div>
  </div>

  {#if mobileNavbarDisplayed}
    <MobileNavbar on:select={toggleNavbar} />
  {/if}
</header>
