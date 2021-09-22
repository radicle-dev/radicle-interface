<script lang="ts">
  import { navigate } from "svelte-routing";
  import type { Config } from '@app/config';

  import DomainInput from '@app/ens/DomainInput.svelte';

  export let config: Config;

  let input = "";

  function register() {
    navigate(`/registrations/${label}/form`);
  }
  $: label = input.trim();
</script>

<style>
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

<svelte:head>
  <title>Radicle: Register</title>
</svelte:head>

<main class="centered">
  <div>
    <div class="input-caption">
      Register a <strong>{config.registrar.domain}</strong> name
    </div>
    <div class="input-main">
      <span class="name">
        <DomainInput
          bind:value={input}
          autofocus
          placeholder=""
          root={config.registrar.domain}
        />
      </span>

      <button disabled={!label} class="primary register" on:click={register}>
        Check
      </button>
    </div>
  </div>
</main>
