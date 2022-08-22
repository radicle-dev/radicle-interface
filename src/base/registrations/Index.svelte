<script lang="ts">
  import { navigate } from "svelte-routing";
  import type { Config } from '@app/config';

  import DomainInput from '@app/ens/DomainInput.svelte';

  export let config: Config;

  let input = "";

  function register() {
    navigate(`/registrations/${label}/form`);
  }

  function validate(input: string): string[] {
    const errors: string[] = [];

    if (input && input.includes(".")) {
      errors.push("Please do not use dots as separators.");
    }
    if (input && input.length < 2) {
      errors.push("Please enter a minimum of 2 characters.");
    }
    if (input && input.length > 128) {
      errors.push("Please enter a maximum of 128 characters.");
    }

    return errors;
  }

  $: label = input.trim();
  $: errors = validate(label);
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
  .explainer {
    width: 28rem;
    margin: 1rem 0;
  }
</style>

<svelte:head>
  <title>Radicle: Register</title>
</svelte:head>

<main class="off-centered">
  <div>
    <div class="input-caption">
      Register a <strong>{config.registrar.domain}</strong> name
      <div class="text-small explainer">
        Register a unique name with our ENS registrar, under the <strong>radicle.eth</strong>
        domain (e.g. cloudhead.radicle.eth). Radicle names never expire and free
        to register.
      </div>
    </div>
    <div class="input-main">
      <span class="name">
        <DomainInput
          bind:value={input}
          autofocus
          placeholder=""
          root={config.registrar.domain}
        />
        {#if errors}
          <div class="input-info">
            {#each errors as error}
              <div>{error}</div>
            {/each}
          </div>
        {/if}
      </span>

        <button
          disabled={!label || errors.length !== 0}
          class="primary register regular"
          on:click={register}>
            Check
        </button>
    </div>
  </div>
</main>
