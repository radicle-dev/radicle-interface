<script lang="javascript">
  import { ethers } from 'ethers';
  import { get } from 'svelte/store';
  import { error } from '@app/error.js';
  import { session } from '@app/session.js';
  import { registrar, registerName, registrationFee } from './registrar.js';
  import { STATE, state } from './state.js';

  import RegisterButton from './RegisterButton.svelte';

  export let config = null;

  let subdomain = "";

  async function getFee(cfg) {
    let fee = await registrationFee(cfg);
    return ethers.utils.formatUnits(fee);
  }
</script>

<style>
  main {
    padding-top: 2rem;
    align-self: center;
  }
  input.subdomain {
    margin-right: 0;
    border-radius-top-right: 0;
    border-radius-bottom-right: 0;
    border-radius: var(--border-radius) 0 0 var(--border-radius);
    border-right: none;
  }
  input.subdomain[disabled] {
    color: var(--color-secondary);
  }
  .available {
    line-height: 1.75em;
    padding: 2rem;
  }
  div.input-caption {
    font-size: 1.25rem;
    text-align: left;
    margin-left: 1.5rem;
    padding-left: 1.5rem;
    color: var(--color-secondary);
  }
  div.input-main {
    display: flex;
    align-items: center;
    flex-direction: row;
    margin-left: 1.5rem;
    color: var(--color-secondary);
  }
  .domain {
    color: var(--color-secondary);
  }
  .name {
    margin: 1rem;
  }
  .name div {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
  .name input {
    margin: 0;
  }
  span.root {
    line-height: 1.5em;
    margin: 1rem;
    margin-left: 0;
    margin-right: 0;
	padding: 1rem 2rem;
    color: var(--color-secondary);
    border-radius: 0 var(--border-radius) var(--border-radius) 0;
    border: 1px solid var(--color-secondary);
    border-left: none;
  }
  .register {
    margin: 1rem;
  }
</style>

<main>
  {#if $state === STATE.IDLE  || $state === STATE.CHECKING_AVAILABILITY}
    <div class="input-caption">
      Register a <strong>radicle.eth</strong> name
    </div>
    <div class="input-main">
      <span class="name">
        <div>
          <input
            autofocus
            placeholder=""
            class="subdomain"
            disabled={$state === STATE.CHECKING_AVAILABILITY}
            type="text" bind:value={subdomain}
          />
          <span class="root">.radicle.eth</span>
        </div>
      </span>
      <RegisterButton {subdomain} {config} />
    </div>
  {:else}
    <div class="modal">
      <div class="modal-title">
        {subdomain}.radicle.eth
      </div>
      {#if $state === STATE.REGISTERED}
        <div class="available">The name <span class="domain">{subdomain}</span> has been successfully registered to {$session.address}.</div>
      {:else if $state === STATE.NAME_AVAILABLE}
        <div class="available">The name <span class="domain">{subdomain}</span> is available for registration.</div>
      {:else if $state === STATE.APPROVING}
        <div class="available">
          Approving Radicle for {#await getFee(config)}
            ?
          {:then fee}
            {fee}
          {/await} <strong>RAD</strong>...
        </div>
      {:else if $state == STATE.NAME_UNAVAILABLE}
        <div class="available">The name <span class="domain">{subdomain}</span> is not available for registration.</div>
      {/if}
      <div class="modal-actions">
        <RegisterButton {subdomain} />
      </div>
    </div>
  {/if}
</main>
