<script lang="typescript">
  import { navigate } from 'svelte-routing';
  import type { Config } from '@app/config';
  import { Org } from './Org';
  import Loading from '@app/Loading.svelte';
  import Modal from '@app/Modal.svelte';

  export let address: string;
  export let config: Config;

  const back = () => {
    navigate("/orgs");
  };
</script>

{#await Org.get(address, config)}
  <Loading/>
{:then org}
  {#if org}
    <div>
      <table>
        <tr><td class="label">Address</td><td>{org.address}</td></tr>
        <tr><td class="label">Safe</td><td>{org.safe}</td></tr>
      </table>
    </div>
  {:else}
    <Modal subtle>
      <span slot="title">🏜️</span>
      <span slot="body">Sorry, <span class="highlight">{address}</span> is not an Org address.</span>
      <span slot="actions">
        <button on:click={back}>
          Back
        </button>
      </span>
    </Modal>
  {/if}
{:catch err}
  {err}
{/await}
