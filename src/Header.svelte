<script lang="js">
  // TODO: Shorten tx hash
  // TODO: Link to correct network on etherscan
  import { ethers } from "ethers";
  import { STATE, state, error } from "./state.js";
  import { ERROR } from "./error.js";
  import { CONNECTION, session, connectWallet, disconnectWallet, shortAddress } from "./session.js";
  import Logo from './Logo.svelte';
  import Connect from './Connect.svelte';

  let sessionButton = null;
  let sessionButtonHover = false;

  function formatBalance(balance) {
    return ethers.utils.commify(ethers.utils.formatUnits(balance));
  }
</script>

<style>
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0;
    padding: 1rem;
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
  }
  .indicator {
    font-size: 0.5rem;
    margin-left: 0.5rem;
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
  <Logo style="margin-top: -1rem" />

  {#if $session.address}
    <div>
      <span class="balance">
        {formatBalance($session.tokenBalance)} <strong>RAD</strong>
      </span>

      <button class="address outline small" bind:this={sessionButton}
        on:click={disconnectWallet}
        on:mouseover={() => sessionButtonHover = true}
        on:mouseout={() => sessionButtonHover = false}
      >
        {#if sessionButtonHover}
          Disconnect
        {:else}
          {shortAddress($session.address)}
        {/if}
      </button>
    </div>
  {:else}
    <Connect className="small" />
  {/if}
</header>
