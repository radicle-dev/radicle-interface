<script lang="typescript">
  // TODO: Shorten tx hash
  // TODO: Link to correct network on etherscan
  import { derived } from "svelte/store";
  import { ethers } from "ethers";
  import { link } from "svelte-routing";
  import { formatBalance, formatAddress } from "@app/utils";
  import { error, Failure } from '@app/error';
  import { session, disconnectWallet } from "@app/session";
  import Logo from './Logo.svelte';
  import Connect from './Connect.svelte';

  let sessionButton = null;
  let sessionButtonHover = false;

  $: address = $session.address;
  $: tokenBalance = $session.tokenBalance;
</script>

<style>
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0;
    padding: 1rem;
  }
  header .nav {
    display: inline-block;
    height: 100%;
    margin-right: 0.5rem;
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
    margin-left: 2rem;
    width: 9.75rem;
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
  <Logo />

  <div>
    <span class="nav">
      <a use:link href="/register/">Register</a>
      <a use:link href="/orgs/">Orgs</a>
      <a use:link href="/vesting/">Vesting</a>
    </span>

    {#if address}
      <span class="balance">
        {formatBalance(tokenBalance)} <strong>RAD</strong>
      </span>

      <button class="address outline small" bind:this={sessionButton}
        on:click={disconnectWallet}
        on:mouseover={() => sessionButtonHover = true}
        on:mouseout={() => sessionButtonHover = false}
      >
        {#if sessionButtonHover}
          Disconnect
        {:else}
          {formatAddress(address)}
        {/if}
      </button>
    {:else}
      <Connect className="small" />
    {/if}
  </div>
</header>
