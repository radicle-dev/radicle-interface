<script lang="ts" strictEvents>
  import type { Wallet } from "@app/lib/wallet";
  import type { User } from "@app/lib/profile";

  import * as modal from "@app/lib/modal";
  import * as router from "@app/lib/router";
  import * as utils from "@app/lib/utils";
  import { formatAddress, isAddressEqual } from "@app/lib/utils";

  import ErrorModal from "@app/components/ErrorModal.svelte";
  import Modal from "@app/components/Modal.svelte";
  import Loading from "@app/components/Loading.svelte";
  import TextInput from "@app/components/TextInput.svelte";

  import SuccessModal from "@app/views/profiles/SetNameModal/SuccessModal.svelte";

  export let entity: User;
  export let wallet: Wallet;

  let name = "";
  let state: "idle" | "checking" | "signing" | "pending" = "idle";

  const submit = async () => {
    if (!valid) {
      return;
    }
    state = "checking";

    const domain = `${name}.${wallet.registrar.domain}`;
    const resolved = await wallet.provider.resolveName(domain);

    if (resolved && isAddressEqual(resolved, entity.address)) {
      modal.disableHide();
      try {
        state = "signing";
        const tx = await entity.setName(domain, wallet);

        state = "pending";
        await tx.wait();
        modal.show({
          component: SuccessModal,
          props: {
            name,
            domain: wallet.registrar.domain,
            address: entity.address,
          },
        });
      } catch (error: unknown) {
        let message: string;
        if (error instanceof Error) {
          message = error.message;
        } else {
          message = "Unknown error. Check dev console for details.";
          console.error(error);
        }
        modal.show({
          component: ErrorModal,
          props: {
            title: "Transaction failed",
            error: message,
          },
        });
      }
    } else {
      modal.show({
        component: ErrorModal,
        props: {
          title: "Registration mismatch",
          caption: `The name ${domain} does not resolve to ${utils.formatAddress(
            entity.address,
          )}. Please update the ENS record for ${domain} to the correct address and try again.`,
          primaryAction: {
            name: "Go to registration",
            callback: () => {
              modal.hide();
              router.push({
                resource: "registrations",
                params: {
                  view: {
                    resource: "view",
                    params: { nameOrDomain: domain, retry: false },
                  },
                },
              });
            },
          },
        },
      });
    }
  };

  $: valid = name !== "" && state === "idle";

  $: primaryAction = ["idle", "checking"].includes(state)
    ? { name: "Submit", callback: submit, props: { disabled: !valid } }
    : undefined;
</script>

<Modal
  emoji="🧣"
  title="Associate profile"
  {primaryAction}
  closeAction={state === "idle" || state === "checking"
    ? { name: "Cancel" }
    : false}>
  <div slot="subtitle">
    {#if state === "signing"}
      Please confirm the transaction in your wallet.
    {:else if state === "pending"}
      Waiting for transaction to be processed…
    {:else}
      Set a ENS name for <span class="txt-bold">
        {formatAddress(entity.address)}
      </span>
      to associate a profile.
    {/if}
  </div>

  <div slot="body">
    {#if state === "idle" || state === "checking"}
      <div style:margin-bottom="1.5rem">
        ENS profiles provide human-identifiable data to your profile, such as a
        <br />
        unique name, avatar and URL, and help make your profile more discoverable.
      </div>
      <div style:width="25rem" style:margin="auto">
        <TextInput
          autofocus
          disabled={state !== "idle"}
          on:submit={submit}
          loading={state === "checking"}
          {valid}
          bind:value={name}>
          <svelte:fragment slot="right">
            .{wallet.registrar.domain}
          </svelte:fragment>
        </TextInput>
      </div>
    {:else}
      <div style:margin-top="1.5rem">
        <Loading noDelay small center />
      </div>
    {/if}
  </div>
</Modal>
