<script lang="typescript">
  import { navigate } from "svelte-routing";
  import { registrar } from './registrar';
  import type { Config } from '@app/config';

  import Modal from '@app/Modal.svelte';
  import DomainInput from '@app/ens/DomainInput.svelte';

  enum State {
    Idle,
    CheckingAvailability,
    NameAvailable,
    NameUnavailable,
  }

  export let config: Config;

  let state = State.Idle;
  let inputValue: string;

  function checkAvailability(name: string) {
    state = State.CheckingAvailability;

    registrar(config).available(name).then((isAvailable: boolean) => {
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
</style>

<main>
  {#if state === State.NameUnavailable}
    <Modal floating>
      <span slot="title">
        {inputValue}.{config.registrar.domain}
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
    Register a <strong>{config.registrar.domain}</strong> name
  </div>
  <div class="input-main">
    <span class="name">
      <DomainInput
        bind:value={inputValue}
        autofocus
        placeholder=""
        disabled={state === State.CheckingAvailability}
        root={config.registrar.domain}
      />
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
