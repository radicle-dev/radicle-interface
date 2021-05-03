<script lang="typescript">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { navigate } from "svelte-routing";
  import { ethers } from 'ethers';
  import { error } from '@app/error';
  import { registrar } from './registrar';

  import Modal from '@app/Modal.svelte';

  enum State {
    Idle,
    CheckingAvailability,
    NameAvailable,
    NameUnavailable,
  }

  export let config;

  let state = State.Idle;
  let inputValue;
  let inputElement;

  onMount(() => {
    inputElement.focus();
  });

  function checkAvailability(name) {
    state = State.CheckingAvailability;

    registrar(config).available(name).then(isAvailable => {
      if (isAvailable) {
        state = State.NameAvailable;
        navigate(`/register/${name}`);
      } else {
        state = State.NameUnavailable;
      }
    });
  }
</script>

<style>
  main {
    padding-top: 2rem;
    align-self: center;
  }
  input.subdomain {
    margin-right: 0;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-radius: var(--border-radius) 0 0 var(--border-radius);
    border-right: none;
  }
  input.subdomain[disabled] {
    color: var(--color-secondary);
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
</style>

<main>
  {#if state === State.NameUnavailable}
    <Modal floating>
      <span slot="title">
        {inputValue}.radicle.eth
      </span>
      <span slot="body">
        The name <span class="highlight">{inputValue}</span> is not available for registration.
      </span>
      <span slot="actions">
        <button on:click={() => state = State.Idle} class="secondary">
          Back
        </button>
      </span>
    </Modal>
  {/if}

  <div class="input-caption">
    Register a <strong>radicle.eth</strong> name
  </div>
  <div class="input-main">
    <span class="name">
      <div>
        <input
          bind:this={inputElement}
          bind:value={inputValue}
          placeholder=""
          class="subdomain"
          disabled={state === State.CheckingAvailability}
          type="text"
        />
        <span class="root">.radicle.eth</span>
      </div>
    </span>
    {#if !inputValue}
      <button disabled class="primary register">
        Check
      </button>
    {:else if state === State.CheckingAvailability}
      <button disabled class="primary register" data-waiting>
        Check
      </button>
    {:else}
      <button on:click={() => checkAvailability(inputValue)} class="primary register">
        Check
      </button>
    {/if}
  </div>
</main>
