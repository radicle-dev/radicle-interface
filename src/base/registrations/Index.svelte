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
  .input-info {
    position: absolute;
    font-style: italic;
    margin-top: 0.1rem;
  }
</style>

<svelte:head>
  <title>Radicle: Register</title>
</svelte:head>

<main class="off-centered">
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
        {#if label && label.length < 2}
          <span class="input-info">Please enter a minimum of 2 characters.</span>
        {:else if label && label.length > 128}
          <span class="input-info">Please enter a maximum of 128 characters.</span>
        {/if}
      </span>

      <button disabled={!label || label.length < 2 || label.length > 128} class="primary register regular" on:click={register}>
        Check
      </button>
    </div>
  </div>
</main>
