<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Modal from '@app/Modal.svelte';
  import type { Config } from '@app/config';
  import { formatAddress, isAddressEqual } from '@app/utils';
  import DomainInput from '@app/ens/DomainInput.svelte';
  import type { Org } from '@app/base/orgs/Org';
  import Loading from '@app/Loading.svelte';
  import Error from '@app/Error.svelte';
  import Address from '@app/Address.svelte';
  import * as utils from '@app/utils';

  const dispatch = createEventDispatcher();

  export let org: Org;
  export let config: Config;

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

    if (resolved && isAddressEqual(resolved, org.address)) {
      try {
        if (await utils.isSafe(org.owner, config)) {
          state = State.Proposing;
          await org.setNameMultisig(domain, config);
          state = State.Proposed;
        } else {
          state = State.Signing;
          let tx = await org.setName(domain, config);
          state = State.Pending;
          await tx.wait();
          state = State.Success;
        }
      } catch (e) {
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
      The ENS name for {org.address} was set to
      <strong>{name}.{config.registrar.domain}</strong>.
    </div>

    <div slot="actions">
      <button class="small" on:click={() => dispatch('close')}>
        Done
      </button>
    </div>
  </Modal>
{:else if state === State.Proposed}
  <Modal floating>
    <div slot="title">
      🪴
    </div>

    <div slot="subtitle">
      <p>The transaction to set the ENS name for <strong>{formatAddress(org.address)}</strong>
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
  <Error floating title="🖊️" action="Okay" on:close>
    The name <strong>{name}.{config.registrar.domain}</strong> does not
    resolve to <strong>{formatAddress(org.address)}</strong>. Please update
    The ENS record for {name}.{config.registrar.domain} to
    point to the correct address and try again.
  </Error>
{:else if state === State.Failed && error}
  <Error floating title="Transaction failed" message={error} on:close />
{:else}
  <Modal floating>
    <div slot="title">
      🖊️
    </div>

    <div slot="subtitle">
      {#if state == State.Signing}
        Please confirm the transaction in your wallet.
      {:else if state == State.Pending}
        Transaction is being processed by the network...
      {:else if state == State.Proposing}
        Proposal is being submitted to the safe
        <strong>{formatAddress(org.owner)}</strong>,
        please sign the transaction in your wallet.
      {:else}
        Set an ENS name for <strong>{formatAddress(org.address)}</strong>
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
