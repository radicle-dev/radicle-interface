<script lang="ts">
  import type { Session } from "@app/lib/session";
  import type { Wallet } from "@app/lib/wallet";

  import { onMount } from "svelte";

  import * as router from "@app/lib/router";
  import BlockTimer from "@app/views/registrations/BlockTimer.svelte";
  import Button from "@app/components/Button.svelte";
  import ErrorModal from "@app/components/ErrorModal.svelte";
  import Loading from "@app/components/Loading.svelte";
  import Modal from "@app/components/Modal.svelte";
  import { registerName, State, state } from "@app/lib/registrar";
  import { twemoji } from "@app/lib/utils";

  export let wallet: Wallet;
  export let name: string;
  export let owner: string | null;
  export let session: Session;

  let error: Error | null = null;
  const registrationOwner = owner || session.address;

  function view() {
    router.push({
      resource: "registrations",
      params: {
        view: {
          resource: "view",
          params: {
            nameOrDomain: `${name}.${wallet.registrar.domain}`,
            retry: true,
          },
        },
      },
    });
  }

  onMount(async () => {
    try {
      await registerName(name, registrationOwner, wallet);
    } catch (e: any) {
      console.error("Error", e);

      state.set({ connection: State.Failed });
      error = e;
    }
  });

  let latestBlock: number;
  wallet.provider.on("block", (block: number) => {
    latestBlock = block;
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
  <ErrorModal
    title="Transaction failed"
    message={error.message}
    on:close={() =>
      router.push({
        resource: "registrations",
        params: { view: { resource: "validateName" } },
      })} />
{:else}
  <Modal>
    <span slot="title" use:twemoji>
      {#if $state.connection === State.Registered}
        <div>🎉</div>
      {:else}
        <div>🌐</div>
      {/if}
      {name}.{wallet.registrar.domain}
    </span>

    <span slot="subtitle">
      {#if $state.connection === State.Connecting}
        Connecting…
      {:else if $state.connection === State.SigningPermit}
        Approving registration fee. Please confirm in your wallet.
      {:else if $state.connection === State.SigningCommit}
        Committing to <span class="txt-bold">{name}</span>
        . Please confirm transaction in your wallet.
      {:else if $state.connection === State.Committing}
        Waiting for <span class="txt-bold">commit</span>
        transaction to be processed&hellip;
      {:else if $state.connection === State.WaitingToRegister && $state.commitmentBlock}
        Waiting for commitment to mature. This may take a moment.
      {:else if $state.connection === State.SigningRegister}
        Proceeding with registration. Please confirm transaction in your wallet.
      {:else if $state.connection === State.Registering}
        Waiting for <span class="txt-bold">register</span>
        transaction to be processed&hellip;
      {/if}
    </span>

    <span slot="body" class="loader">
      {#if $state.connection === State.Registered}
        This name has been successfully registered to
        <span class="txt-highlight">{registrationOwner}</span>
      {:else if $state.connection === State.WaitingToRegister && $state.commitmentBlock}
        <BlockTimer
          {latestBlock}
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
