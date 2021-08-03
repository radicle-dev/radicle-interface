<script lang="ts">
  import { link } from "svelte-routing";
  import { formatAddress, formatBalance } from "@app/utils";
  import { error, Failure } from '@app/error';
  import { disconnectWallet } from "@app/session";
  import type { Session } from '@app/session';
  import Loading from '@app/Loading.svelte';
  import Logo from '@app/Logo.svelte';
  import Connect from '@app/Connect.svelte';
  import type { Config } from '@app/config';
  import { Profile } from "@app/profile";
  import Avatar from "./Avatar.svelte";

  export let session: Session | null;
  export let config: Config;

  let sessionButton: HTMLElement | null = null;
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
  }
  header .nav {
    display: inline-block;
    height: 100%;
    margin-left: 1.5rem;
    white-space: nowrap;
  }
  header .nav a {
    display: inline-block;
    padding: 0.5rem 0.5rem;
    margin-right: 1.5rem;
    font-weight: 500;
    color: var(--color-foreground-6);
  }
  header .nav a:hover {
    color: var(--color-foreground);
  }
  header .left, header .right {
    display: flex;
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
  .address {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    min-height: 42px;
    margin-left: 2rem;
    width: 9.25rem;
  }
  .connect {
    display: inline-block;
    margin-left: 2rem;
  }
  .network {
    color: var(--color-tertiary);
    background-color: var(--color-tertiary-background);
    line-height: 1.5em;
    padding: 0.5rem 1rem;
    border-radius: var(--border-radius);
  }
  .network.unavailable {
    color: #888;
    background-color: #ffffff11;
  }
  .network:last-child {
    margin-right: 0;
  }

  .balance {
    margin-left: 2rem;
    white-space: nowrap;
  }

  @media(max-width: 800px) {
    .balance {
      display: none;
    }
  }
  @media(max-width: 720px) {
    .network {
      display: none;
    }
  }
</style>

{#if $error}
  {#if $error.type === Failure.TransactionFailed}
    <div class="error">
      {#if $error.message}
        <strong>Error:</strong> {$error.message}
      {:else if $error.txHash}
        <strong>Error:</strong> Transaction <a href="https://etherscan.io/tx/{$error.txHash}">{$error.txHash}</a> failed.
      {/if}
    </div>
  {/if}
{/if}

<header>
  <div class="left">
    <a use:link href="/"><Logo /></a>
    <div class="nav">
      <a use:link href="/orgs/">Orgs</a>
      <a use:link href="/registrations">Register</a>
    </div>
  </div>

  <div class="right">
    {#if config && config.network.name == 'rinkeby'}
      <span class="network">Rinkeby</span>
    {:else if config && config.network.name == 'homestead'}
      <!-- Don't show anything -->
    {:else}
      <span class="network unavailable">No Network</span>
    {/if}

    {#if address}
      <span class="balance">
        {#if tokenBalance}
          {formatBalance(tokenBalance)} <strong>RAD</strong>
        {:else}
          <Loading small />
        {/if}
      </span>

      <button class="address outline small" bind:this={sessionButton}
        on:click={() => disconnectWallet(config)}
        on:mouseover={() => sessionButtonHover = true}
        on:mouseout={() => sessionButtonHover = false}
      >
        {#await Profile.get(address, config)}
          <Loading small center />
        {:then profile}
          {#if sessionButtonHover}
            Disconnect
          {:else}
            <Avatar source={profile.avatar ?? address} inline />{formatAddress(address)}
          {/if}
        {/await}
      </button>
    {:else if config}
      <span class="connect">
        <Connect className="small" {config} />
      </span>
    {/if}
  </div>
</header>
