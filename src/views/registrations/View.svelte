<script lang="ts">
  import type { EnsRecord } from "@app/lib/resolver";
  import type { Field, RegistrationRecord } from "@app/components/Form.svelte";
  import type { Registration } from "@app/lib/registrar";
  import type { Wallet } from "@app/lib/wallet";
  import type { ethers } from "ethers";

  import { onMount } from "svelte";

  import * as modal from "@app/lib/modal";
  import * as router from "@app/lib/router";
  import { assert } from "@app/lib/error";
  import { defaultSeedPort } from "@app/lib/seed";
  import { getRegistration, getOwner } from "@app/lib/registrar";
  import { isAddressEqual, isReverseRecordSet, twemoji } from "@app/lib/utils";
  import { session } from "@app/lib/session";

  import Button from "@app/components/Button.svelte";
  import Form from "@app/components/Form.svelte";
  import Loading from "@app/components/Loading.svelte";
  import ErrorModal from "@app/components/ErrorModal.svelte";

  import Update from "@app/views/registrations/Update.svelte";
  import CheckNameModal from "@app/views/registrations/CheckNameModal.svelte";

  export let domain: string;
  export let wallet: Wallet;
  export let retry: boolean;

  domain = domain.toLowerCase();

  if (!domain.includes(".")) {
    domain = `${domain}.${wallet.registrar.domain}`;
  }

  let state:
    | { type: "loading" }
    | { type: "notFound" }
    | { type: "found"; registration: Registration; owner: string } = {
    type: "loading",
  };

  let editable = false;
  let fields: Field[] = [];
  let updateRecords: EnsRecord[] | null = null;
  let retries = 3;
  let resolver: ethers.providers.EnsResolver | undefined = undefined;

  async function parseRecords(
    r: Registration | null,
  ): Promise<Registration | null> {
    if (r) {
      let reverseRecord = false;
      if (r.profile.address) {
        reverseRecord = await isReverseRecordSet(
          r.profile.address,
          domain,
          wallet,
        );
      }
      const owner = await getOwner(domain, wallet);
      resolver = r.resolver;

      fields = [
        {
          name: "owner",
          validate: "address",
          placeholder: "",
          description: "The owner and controller of this name.",
          value: owner,
          resolve: true,
          editable: false,
        },
        {
          name: "address",
          validate: "address",
          placeholder: "Ethereum address, eg. 0x4a9cf21…bc91",
          description:
            "The address this name resolves to. " +
            (reverseRecord
              ? `The reverse record for this address is set to **${domain}**`
              : "The reverse record for this address is **not set**. " +
                "For this name to be correctly associated with the address, " +
                "a reverse record should be set."),
          value: r.profile.address ?? "",
          editable: true,
        },
        {
          name: "url",
          label: "URL",
          validate: "URL",
          placeholder: "https://acme.org",
          description: "A homepage or other URL associated with this name.",
          value: r.profile.url ?? "",
          editable: true,
        },
        {
          name: "avatar",
          validate: "URL",
          placeholder: "https://acme.org/avatar.png",
          description: "An avatar or square image associated with this name.",
          value: r.profile.avatar ?? "",
          editable: true,
        },
        {
          name: "twitter",
          validate: "handle",
          placeholder: "Twitter username, eg. 'acme'",
          description: "The Twitter handle associated with this name.",
          value: r.profile.twitter ?? "",
          editable: true,
        },
        {
          name: "github",
          validate: "handle",
          label: "GitHub",
          placeholder: "GitHub username, eg. 'acme'",
          description: "The GitHub username associated with this name.",
          value: r.profile.github ?? "",
          editable: true,
        },
        {
          name: "id",
          label: "Radicle",
          validate: "identity",
          placeholder: window.HEARTWOOD
            ? "Radicle ID, eg. rad:zKtT7DmF9H34KkvcKj…"
            : "Radicle ID, eg. rad:git:hnrkqdpm9ub19oc8d…",
          description: "The local radicle identity associated with this name.",
          value: r.profile.id ?? "",
          editable: true,
        },
        {
          name: "seed.host",
          label: "Seed Host",
          validate: "domain",
          placeholder: "seed.acme.org",
          url: r.profile.seed && `/seeds/${r.profile.seed.host}`,
          description:
            "The seed host address. " +
            "Only domain names with TLS are supported. " +
            `HTTP(S) API requests use port ${defaultSeedPort}.`,
          value: r.profile.seed?.host ?? "",
          editable: true,
        },
        {
          name: "seed.id",
          label: "Seed ID",
          validate: "id",
          placeholder: "hynkyndc6w3p8urucakobzncqny7xxtw88…",
          description:
            "The Device ID of a Radicle Link node that hosts entities associated with this name.",
          value: r.profile.seed?.id ?? "",
          editable: true,
        },
      ];
      state = { type: "found", registration: r, owner };
    } else {
      state = { type: "notFound" };
    }
    if (retry) retries -= 1;
    return r;
  }

  function showErrorModal(message: string) {
    modal.show({
      component: ErrorModal,
      props: {
        title: "Registration could not be loaded",
        error: message,
        closeAction: {
          callback: () => {
            router.push({
              resource: "registrations",
              params: { view: { resource: "form" } },
            });
            modal.hide();
          },
        },
      },
    });
  }

  onMount(() => {
    getRegistration(domain, wallet, resolver)
      .then(parseRecords)
      .catch(error => {
        showErrorModal(error.message);
      });
  });

  const onSave = async (event: { detail: RegistrationRecord[] }) => {
    assert(state.type === "found", "registration must be found");

    updateRecords = event.detail.map(f => {
      return { name: f.name, value: f.value };
    });

    modal.show({
      component: Update,
      props: {
        wallet,
        domain,
        registration: state.registration,
        records: updateRecords,
      },
    });
  };

  $: if (retry && state.type === "notFound" && retries > 0) {
    getRegistration(domain, wallet, resolver)
      .then(parseRecords)
      .catch(error => {
        showErrorModal(error.message);
      });
  }

  $: isOwner = (owner: string): boolean => {
    return $session ? isAddressEqual(owner, $session.address) : false;
  };
</script>

<style>
  main {
    padding: 5rem 0;
  }
  main > header {
    display: flex;
    align-items: center;
    justify-content: left;
    margin-bottom: 2rem;
  }
  main > header > * {
    margin: 0 1rem 0 0;
  }
  .emoji {
    font-size: var(--font-size-xx-large);
  }
  @media (max-width: 720px) {
    main {
      width: 100%;
      padding-left: 1rem;
      padding-right: 1rem;
    }
  }

  .placeholder {
    text-align: center;
  }
  .container {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>

<svelte:head>
  <title>{domain}</title>
</svelte:head>

{#if state.type === "loading"}
  <Loading />
{:else if state.type === "notFound"}
  <div class="container">
    <div class="placeholder">
      <div class="emoji" use:twemoji>🍄</div>
      <div class="txt-highlight txt-medium txt-bold">{domain}</div>
      <p style:margin-bottom="2rem">
        The name <span class="txt-bold">{domain}</span>
        is not registered.
      </p>
      <Button
        on:click={() => {
          modal.show({
            component: CheckNameModal,
            props: {
              name: domain.replace(`.${wallet.registrar.domain}`, ""),
              wallet,
              owner: null,
            },
          });
        }}
        variant="primary">
        Register
      </Button>
    </div>
  </div>
{:else if state.type === "found"}
  <main>
    <header>
      <div class="txt-title txt-bold">{domain}</div>
      <div style="width: 4rem;">
        {#if !editable}
          <Button
            size="small"
            variant="primary"
            disabled={!isOwner(state.owner)}
            title={!isOwner(state.owner)
              ? "Only owner can edit this profile"
              : ""}
            on:click={() => (editable = !editable)}>
            Edit
          </Button>
        {/if}
      </div>
    </header>
    <Form
      {wallet}
      {editable}
      {fields}
      on:save={onSave}
      on:cancel={() => (editable = false)} />
  </main>
{/if}
