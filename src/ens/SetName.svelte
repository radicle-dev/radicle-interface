<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { navigate } from 'svelte-routing';
  import Modal from '@app/Modal.svelte';
  import type { Config } from '@app/config';
  import { formatAddress, isAddressEqual } from '@app/utils';
  import DomainInput from '@app/ens/DomainInput.svelte';
  import { Org } from '@app/base/orgs/Org';
  import type { User } from '@app/base/users/User';
  import Loading from '@app/Loading.svelte';
  import Error from '@app/Error.svelte';
  import Address from '@app/Address.svelte';
  import * as utils from '@app/utils';

  const dispatch = createEventDispatcher();

  export let entity: Org | User;
  export let config: Config;

  const org = Org.hasOwnProperty.call(entity, "owner")
    ? entity as Org
    : null;

  const label = org ? "org" : "profile";

  enum State {
    Idle,
    Checking,

    // Single-sig states.
    Signing,
    Pending,
    Success,

    // Multi-sig states.
    Proposing,
    Proposed,

    Failed,
    Mismatch,
  }

  let name = "";
  let state = State.Idle;
  let error: string | null = null;

  const onSubmit = async () => {
    state = State.Checking;

    let domain = `${name}.${config.registrar.domain}`;
    let resolved = await config.provider.resolveName(domain);

    if (resolved && isAddressEqual(resolved, entity.address)) {
      try {
        if (org && await utils.isSafe(org.owner, config)) {
          state = State.Proposing;
          await org.setNameMultisig(domain, config);
          state = State.Proposed;
        } else {
          state = State.Signing;
          let tx = await entity.setName(domain, config);
          state = State.Pending;
          await tx.wait();
          state = State.Success;
        }
      } catch (e: any) {
        console.error(e);
        state = State.Failed;
        error = e.message;
      }
    } else {
      state = State.Mismatch;
    }
  };
</script>

{#if state === State.Success}
  <Modal floating>
    <div slot="title">
      ✅
    </div>

    <div slot="subtitle">
      The ENS name for {entity.address} was set to
      <strong>{name}.{config.registrar.domain}</strong>.
    </div>

    <div slot="actions">
      <button class="small" on:click={() => dispatch('close')}>
        Done
      </button>
    </div>
  </Modal>
{:else if state === State.Proposed && org}
  <Modal floating>
    <div slot="title">
      🪴
    </div>

    <div slot="subtitle">
      <p>The transaction to set the ENS name for <strong>{formatAddress(entity.address)}</strong>
      to <strong>{name}.{config.registrar.domain}</strong> was proposed to:</p>
      <p><Address address={org.owner} {config} compact /></p>
    </div>

    <div slot="actions">
      <button class="small" on:click={() => dispatch('close')}>
        Done
      </button>
    </div>
  </Modal>
{:else if state === State.Mismatch}
  <Error floating title="🧣" on:close>
    The name <strong>{name}.{config.registrar.domain}</strong> does not
    resolve to <strong>{entity.address}</strong>. Please update
    the ENS record for {name}.{config.registrar.domain} to
    point to the correct address and try again.

    <div slot="actions">
      <button on:click={() => navigate(`/registrations/${name}`)}>
        Go to registration &rarr;
      </button>
      <button on:click={() => dispatch('close')} class="text">
        Close
      </button>
    </div>
  </Error>
{:else if state === State.Failed && error}
  <Error floating title="Transaction failed" message={error} on:close />
{:else}
  <Modal floating>
    <div slot="title">
      <div>🧣</div>
      <span>Associate profile</span>
    </div>

    <div slot="subtitle">
      {#if state == State.Signing}
        Please confirm the transaction in your wallet.
      {:else if state == State.Pending}
        Waiting for transaction to be processed...
      {:else if state == State.Proposing && org}
        Proposal is being submitted
        <strong>{formatAddress(org.owner)}</strong>,
        please sign the transaction in your wallet.
      {:else}
        Set an ENS name for <strong>{formatAddress(entity.address)}</strong>
        to associate a profile.
        ENS profiles provide human-identifiable data to your {label}, such as a
        unique name, avatar and URL, and help make your {label} more discoverable.
      {/if}
    </div>

    <div slot="body">
      {#if state === State.Idle || state === State.Checking}
        <DomainInput root={config.registrar.domain}
          autofocus disabled={state !== State.Idle} bind:value={name} />
      {:else}
        <Loading small center />
      {/if}
    </div>

    <div slot="actions">
      {#if state == State.Signing}
        <button class="small" on:click={() => dispatch('close')}>
          Cancel
        </button>
      {:else if state == State.Pending}
        <button class="small" on:click={() => dispatch('close')}>
          Close
        </button>
      {:else}
        <button class="primary" on:click={onSubmit} disabled={!name || state !== State.Idle}>
          {#if state === State.Checking}
            Checking...
          {:else}
            Submit
          {/if}
        </button>

        <button class="text" on:click={() => dispatch('close')}>
          Cancel
        </button>
      {/if}
    </div>
  </Modal>
{/if}
