<script lang="typescript">
  // TODO: Shorten tx hash
  // TODO: Link to correct network on etherscan
  import { derived } from "svelte/store";
  import { ethers } from "ethers";
  import { link } from "svelte-routing";
  import { formatBalance } from "@app/utils";
  import { session, disconnectWallet, shortAddress } from "./session";
  import { error, ERROR } from './error';
  import Logo from './Logo.svelte';
  import Connect from './Connect.svelte';

  let sessionButton = null;
  let sessionButtonHover = false;

  const address = derived(session, $s => { return $s.address });
  const tokenBalance = derived(session, $s => { return $s.tokenBalance });
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
    background-color: var(--color-negative-2);
    padding: 0.5rem;
    border-radius: var(--border-radius);
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
  {#if $error.type === ERROR.TRANSACTION_FAILED}
    <div class="error">
      <strong>Error:</strong> Transaction <a href="https://etherscan.io/tx/{$error.hash}">{$error.hash}</a> failed.
    </div>
  {/if}
{/if}

<header>
  <Logo />

  <div>
    <span class="nav">
      <a use:link href="/register/">Register</a>
      <a use:link href="/vesting/">Vesting</a>
    </span>

    {#if $address}
      <span class="balance">
        {formatBalance($tokenBalance)} <strong>RAD</strong>
      </span>

      <button class="address outline small" bind:this={sessionButton}
        on:click={disconnectWallet}
        on:mouseover={() => sessionButtonHover = true}
        on:mouseout={() => sessionButtonHover = false}
      >
        {#if sessionButtonHover}
          Disconnect
        {:else}
          {shortAddress($address)}
        {/if}
      </button>
    {:else}
      <Connect className="small" />
    {/if}
  </div>
</header>
