<script lang="typescript">
  import { navigate } from "svelte-routing";
  import { registrar } from './registrar';
  import type { Config } from '@app/config';

  import Modal from '@app/Modal.svelte';
  import DomainInput from '@app/ens/DomainInput.svelte';

  export let config: Config;

  let label: string;

  function register() {
    navigate(`/registrations/${label}/form`);
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
  <div class="input-caption">
    Register a <strong>{config.registrar.domain}</strong> name
  </div>
  <div class="input-main">
    <span class="name">
      <DomainInput
        bind:value={label}
        autofocus
        placeholder=""
        root={config.registrar.domain}
      />
    </span>

    <button disabled={!label} class="primary register" on:click={register}>
      Check
    </button>
  </div>
</main>
