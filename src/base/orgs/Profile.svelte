<script lang="typescript">
  import type { Config } from '@app/config';
  import { Org } from './Org';
  import Loading from '@app/Loading.svelte';

  export let address: string;
  export let config: Config;
</script>

{#await Org.get(address, config)}
  <Loading/>
{:then org}
  <div>
    <table>
      <tr><td class="label">Address</td><td>{org.address}</td></tr>
      <tr><td class="label">Safe</td><td>{org.safe}</td></tr>
    </table>
  </div>
{:catch err}
  {err}
{/await}
