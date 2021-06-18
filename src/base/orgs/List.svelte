<script lang="ts">
  import { Link } from 'svelte-routing';
  import type { Org } from '@app/base/orgs/Org';
  import Blockies from '@app/Blockies.svelte';

  export let orgs: Org[];
</script>

<style>
  .org {
    width: 3rem;
    height: 3rem;
    margin: 3rem;
    display: inline-block;
  }
</style>

{#each orgs as org}
  <div class="org">
    <Link to={`/orgs/${org.address}`}>
      <Blockies glowOnHover address={org.address} />
    </Link>
  </div>
{:else}
  <slot />
{/each}
