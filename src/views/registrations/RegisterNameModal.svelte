<script lang="ts">
  import type { Session } from "@app/lib/session";
  import type { Wallet } from "@app/lib/wallet";

  import { onMount } from "svelte";

  import * as modal from "@app/lib/modal";
  import * as utils from "@app/lib/utils";
  import * as router from "@app/lib/router";
  import BlockTimer from "@app/views/registrations/RegisterNameModal/BlockTimer.svelte";
  import CheckNameModal from "@app/views/registrations/CheckNameModal.svelte";
  import ErrorModal from "@app/components/ErrorModal.svelte";
  import Loading from "@app/components/Loading.svelte";
  import Modal from "@app/components/Modal.svelte";
  import { registerName, State, state } from "@app/lib/registrar";

  export let wallet: Wallet;
  export let name: string;
  export let owner: string | null;
  export let session: Session;

  const registrationOwner = owner || session.address;

  onMount(async () => {
    modal.disableHide();
    try {
      await registerName(name, registrationOwner, wallet);
    } catch (error: any) {
      console.error("Error", error);
      modal.show({
        component: ErrorModal,
        props: {
          title: "Could not register name",
          error: error.message,
          closeAction: {
            callback: () => {
              modal.show({
                component: CheckNameModal,
                props: {
                  wallet,
                  name,
                  owner: null,
                },
              });
            },
          },
        },
      });
    }
  });

  let latestBlock: number;
  wallet.provider.on("block", (block: number) => {
    latestBlock = block;
  });

  $: closeAction =
    $state.connection === State.Registered
      ? {
          name: "View",
          callback: () => {
            modal.enableHide();
            modal.hide();
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
          },
          props: { variant: "foreground" as const },
        }
      : (false as const);
</script>

<style>
  .loader {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 1.5rem;
    padding: 0 2rem;
  }
</style>

<Modal
  emoji={$state.connection === State.Registered ? "🎉" : "🌐"}
  title={`${name}.${wallet.registrar.domain}`}
  {closeAction}>
  <span slot="subtitle">
    {#if $state.connection === State.Connecting}
      Connecting…
    {:else if $state.connection === State.SigningPermit}
      Approving registration fee. <br />
      Please confirm in your wallet.
    {:else if $state.connection === State.SigningCommit}
      Committing to <span class="txt-bold">{name}.</span>
      <br />
      Please confirm transaction in your wallet.
    {:else if $state.connection === State.Committing}
      Waiting for <span class="txt-bold">commit</span>
      transaction to be processed…
    {:else if $state.connection === State.WaitingToRegister && $state.commitmentBlock}
      Waiting for commitment to mature.
      <br />
      This may take a moment.
    {:else if $state.connection === State.SigningRegister}
      Proceeding with registration.
      <br />
      Please confirm transaction in your wallet.
    {:else if $state.connection === State.Registering}
      Waiting for the <span class="txt-bold">register</span>
      transaction to be processed…
    {/if}
  </span>

  <span slot="body">
    {#if $state.connection === State.Registered}
      This name has been successfully registered to
      <span class="txt-highlight">
        {utils.formatAddress(registrationOwner)}.
      </span>
    {:else if $state.connection === State.WaitingToRegister && $state.commitmentBlock}
      <div class="loader">
        <BlockTimer
          {latestBlock}
          startBlock={$state.commitmentBlock}
          duration={$state.minAge} />
      </div>
    {:else}
      <div style:margin-top="1.5rem">
        <Loading noDelay small center />
      </div>
    {/if}
  </span>
</Modal>
