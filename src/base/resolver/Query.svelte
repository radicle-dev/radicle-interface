<script lang="ts">
  import { onMount } from 'svelte';
  import { ethers } from 'ethers';
  import { navigate } from 'svelte-routing';
  import type { Config } from '@app/config';
  import * as utils from '@app/utils';
  import Error from '@app/Error.svelte';
  import Loading from '@app/Loading.svelte';

  export let config: Config;
  export let query: string | null;

  let error = false;

  onMount(async () => {
    if (query) {
      if (ethers.utils.isAddress(query)) {
        // Go to org.
        navigate(`/orgs/${query}`, { replace: true });
      } else if (utils.isRadicleId(query)) {
        // Go to Radicle entity.
        alert("Radicle IDs are not yet supported");
      } else {
        let label = utils.parseEnsLabel(query, config);
        if (label.includes(".")) {
          error = true;
        } else {
          // Jump straight to org, if the ENS entry points to an org. Otherwise just go to the
          // registration.
          const address = await utils.resolveLabel(label, config);
          if (address && await utils.identifyAddress(address, config) === utils.AddressType.Org) {
            navigate(`/orgs/${address}`, { replace: true });
          } else {
            navigate(`/registrations/${label}`, { replace: true });
          }
        }
      }
    } else {
      navigate('/');
    }
  });
</script>

<main class="centered">
  {#if error}
    <Error on:close={() => navigate('/')}>
      Invalid query string “{query}”
    </Error>
  {:else}
    <Loading center />
  {/if}
</main>
