<script lang="ts">
  // TODO: When name is registered, prompt user to edit records.
  // TODO: When transfering name, warn about transfering to org.
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import type { Session } from "@app/session";
  import type { Config } from "@app/config";
  import Loading from "@app/Loading.svelte";
  import Modal from "@app/Modal.svelte";
  import Err from "@app/Error.svelte";
  import BlockTimer from "@app/BlockTimer.svelte";
  import Button from "@app/Button.svelte";

  import { registerName, State, state } from "./registrar";

  export let config: Config;
  export let name: string;
  export let owner: string | null;
  export let session: Session;

  let error: Error | null = null;
  const registrationOwner = owner || session.address;

  const view = () =>
    navigate(`/registrations/${name}.radicle.eth`, { state: { retry: true } });

  onMount(async () => {
    try {
      await registerName(name, registrationOwner, config);
    } catch (e: any) {
      console.error("Error", e);

      state.set({ connection: State.Failed });
      error = e;
    }
  });
</script>

<style>
  .loader {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>

<svelte:head>
  <title>{name}</title>
</svelte:head>

{#if error}
  <Err
    title="Transaction failed"
    message={error.message}
    on:close={() => navigate("/registrations")} />
{:else}
  <Modal>
    <span slot="title">
      {#if $state.connection === State.Registered}
        <div>🎉</div>
      {:else}
        <div>🌐</div>
      {/if}
      {name}.{config.registrar.domain}
    </span>

    <span slot="subtitle">
      {#if $state.connection === State.Connecting}
        Connecting...
      {:else if $state.connection === State.SigningPermit}
        Approving registration fee. Please confirm in your wallet.
      {:else if $state.connection === State.SigningCommit}
        Committing to <strong>{name}</strong>
        . Please confirm transaction in your wallet.
      {:else if $state.connection === State.Committing}
        Waiting for <strong>commit</strong>
        transaction to be processed&hellip;
      {:else if $state.connection === State.WaitingToRegister && $state.commitmentBlock}
        Waiting for commitment to mature. This may take a moment.
      {:else if $state.connection === State.SigningRegister}
        Proceeding with registration. Please confirm transaction in your wallet.
      {:else if $state.connection === State.Registering}
        Waiting for <strong>register</strong>
        transaction to be processed&hellip;
      {/if}
    </span>

    <span slot="body" class="loader">
      {#if $state.connection === State.Registered}
        This name has been successfully registered to
        <span class="highlight">{registrationOwner}</span>
      {:else if $state.connection === State.WaitingToRegister && $state.commitmentBlock}
        <BlockTimer
          {config}
          startBlock={$state.commitmentBlock}
          duration={$state.minAge} />
      {:else}
        <Loading small center />
      {/if}
    </span>

    <span slot="actions">
      {#if $state.connection === State.Registered}
        <Button on:click={view} variant="foreground">View</Button>
      {/if}
    </span>
  </Modal>
{/if}
