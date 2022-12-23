<script lang="ts">
  import type { Wallet } from "@app/lib/wallet";

  import { onMount } from "svelte";

  import * as modal from "@app/lib/modal";
  import ErrorModal from "@app/components/ErrorModal.svelte";
  import Loading from "@app/components/Loading.svelte";
  import Modal from "@app/components/Modal.svelte";
  import RegisterNameModal from "@app/views/registrations/RegisterNameModal.svelte";
  import { formatAddress } from "@app/lib/utils";
  import { registrar } from "@app/lib/registrar";
  import { session } from "@app/lib/session";

  export let wallet: Wallet;
  export let name: string;
  export let owner: string | null;

  // We only support lower-case names.
  name = name.toLowerCase();

  let state: "checkingAvailability" | "nameAvailable" | "nameUnavailable" =
    "checkingAvailability";

  function register() {
    if ($session) {
      modal.show({
        component: RegisterNameModal,
        props: {
          wallet,
          session: $session,
          name,
          owner: registrationOwner,
        },
      });
    } else {
      modal.show({
        component: ErrorModal,
        props: {
          title: "Registration failed",
          caption: "You must connect your wallet to register",
        },
      });
    }
  }

  onMount(async () => {
    try {
      const isAvailable = await registrar(wallet).available(name);

      if (isAvailable) {
        state = "nameAvailable";
      } else {
        state = "nameUnavailable";
      }
    } catch (err: any) {
      modal.show({
        component: ErrorModal,
        props: {
          title: "Checking name availability failed",
          error: err.message,
        },
      });
    }
  });

  $: registrationOwner = owner || ($session && $session.address);
  $: primaryAction =
    state === "nameAvailable"
      ? $session
        ? {
            name: "Begin registration",
            callback: register,
          }
        : {
            name: "Connect to register",
            callback: () => {
              // FIXME: this is a workaround until we refactor the
              // wallet/session and can simplify the Connect button logic.
              Array.from(document.querySelectorAll("button"))
                .find(e => {
                  return e.textContent === "Connect";
                })
                ?.click();
            },
          }
      : undefined;
</script>

<style>
  .highlight {
    color: var(--color-secondary);
  }
</style>

<Modal emoji="🌐" title="Register a name" {primaryAction}>
  <span slot="subtitle">
    {name}.{wallet.registrar.domain}
  </span>

  <span slot="body">
    {#if state === "nameAvailable"}
      {#if registrationOwner}
        The name <span class="highlight">
          {name}
        </span>
        is available for registration
        <br />
        under the account
        <span class="txt-bold">{formatAddress(registrationOwner)}.</span>
      {:else}
        The name <span class="highlight">
          {name}
        </span>
        is available.
      {/if}
    {:else if state === "nameUnavailable"}
      The name <span class="highlight">{name}</span>
      is
      <span class="txt-bold">not available</span>
      for registration.
    {:else if state === "checkingAvailability"}
      <Loading noDelay small center />
    {/if}
  </span>
</Modal>
