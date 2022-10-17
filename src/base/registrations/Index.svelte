<script lang="ts">
  import { navigate } from "@app/router";
  import type { Config } from "@app/config";

  import TextInput from "@app/TextInput.svelte";
  import Button from "@app/Button.svelte";

  export let config: Config;

  let input = "";
  let valid: boolean = false;
  let validationMessage: string | undefined = undefined;

  function register() {
    if (!valid) {
      return;
    }
    navigate(`/registrations/${ensName}/form`);
  }

  function validate(input: string) {
    if (input === "") {
      return { valid: false };
    }

    if (input && input.includes(".")) {
      return {
        valid: false,
        validationMessage: "Please do not use dots as separators.",
      };
    }
    if (input && input.length < 2) {
      return {
        valid: false,
        validationMessage: "Please enter a minimum of 2 characters.",
      };
    }
    if (input && input.length > 128) {
      return {
        valid: false,
        validationMessage: "Please enter a maximum of 128 characters.",
      };
    }

    return { valid: true };
  }

  $: ensName = input.trim();
  $: ({ valid, validationMessage } = validate(ensName));
</script>

<style>
  main {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    height: 100%;
    justify-content: center;
    padding-bottom: 24vh;
    padding-top: 5rem;
    width: 32rem;
  }
  .title {
    color: var(--color-secondary);
    font-size: var(--font-size-medium);
  }
  .subtitle {
    color: var(--color-secondary);
  }
  .form {
    display: flex;
    gap: 1rem;
  }
</style>

<svelte:head>
  <title>Radicle &ndash; Register</title>
</svelte:head>

<main>
  <div class="title">
    Register a <span class="txt-bold">{config.registrar.domain}</span>
    name
  </div>

  <div class="subtitle">
    Register a unique name with our ENS registrar, under <br />
    the
    <span class="txt-bold">{config.registrar.domain}</span>
    domain (e.g. cloudhead.{config.registrar.domain}).
    <br />
    Radicle names never expire and free to register.
  </div>

  <div class="form">
    <TextInput
      bind:value={input}
      autofocus
      on:submit={register}
      {valid}
      {validationMessage}>
      <svelte:fragment slot="right">
        .{config.registrar.domain}
      </svelte:fragment>
    </TextInput>

    <Button
      disabled={!valid}
      variant="primary"
      size="regular"
      on:click={register}>
      Check
    </Button>
  </div>
</main>
