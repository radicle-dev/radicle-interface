<script lang="typescript">
  import { createEventDispatcher } from 'svelte';
  import Modal from '@app/Modal.svelte';
  import type { Config } from '@app/config';
  import { formatAddress } from '@app/utils';
  import DomainInput from '@app/ens/DomainInput.svelte';
  import type { Org } from '@app/base/orgs/Org';
  import Loading from '@app/Loading.svelte';

  const dispatch = createEventDispatcher();

  export let org: Org;
  export let config: Config;

  enum State {
    Idle,
    Checking,
    Signing,
    Pending,
    Success,
    Failed,
  }

  let name: string = "";
  let state = State.Idle;
  let mismatchError = false; // Set if the name entered does not resolve to the address.

  const onSubmit = async () => {
    state = State.Checking;

    let domain = `${name}.${config.registrar.domain}`;
    let resolved = await config.provider.resolveName(domain);

    if (resolved === org.address) {
      state = State.Signing;
      try {
        let tx = await org.setName(domain, config);
        state = State.Pending;
        await tx.wait();
        state = State.Success;
      } catch (e) {
        console.error(e);
        state = State.Failed;
      }
    } else {
      state = State.Idle;
      mismatchError = true;
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
{:else}
  <Modal floating>
    <div slot="title">
      {#if mismatchError}
        👻
      {:else}
        🖊️
      {/if}
    </div>

    <div slot="subtitle">
      {#if mismatchError}
        <div class="rror">
          The name <strong>{name}.{config.registrar.domain}</strong> does not
          resolve to <strong>{formatAddress(org.address)}</strong>. Please update
          The ENS record for {name}.{config.registrar.domain} to
          point to the correct address.
        </div>
      {:else if state == State.Signing}
        Please confirm the transaction in your wallet.
      {:else if state == State.Pending}
        Transaction is being processed by the network...
      {:else}
        Set an ENS name for <strong>{formatAddress(org.address)}</strong>
      {/if}
    </div>

    <div slot="body">
      {#if state === State.Idle || state === State.Checking}
        <DomainInput root={config.registrar.domain} on:input={() => mismatchError = false}
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
