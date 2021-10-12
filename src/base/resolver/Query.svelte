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
        const addressType = query && await utils.identifyAddress(query, config);
        if (addressType === utils.AddressType.Org) {
          navigate(`/orgs/${query}`, { replace: true });
        } else if (addressType === utils.AddressType.EOA) {
          navigate(`/users/${query}`, { replace: true });
        }
      } else if (utils.isRadicleId(query)) {
        // Go to Radicle project.
        navigate(`/projects/${query}`, { replace: true });
      } else {
        let label = utils.parseEnsLabel(query, config);
        if (label.includes(".")) {
          error = true;
        } else {
          // Jump straight to org, if the ENS entry points to an org. Otherwise it checks if the
          // address type is an EOA and jumps to the user page else it just goes to the registration.
          const address = await utils.resolveLabel(label, config);
          const addressType = address && await utils.identifyAddress(address, config);
          if (addressType === utils.AddressType.Org) {
            navigate(`/orgs/${address}`, { replace: true });
          } else if (addressType === utils.AddressType.EOA) {
            navigate(`/users/${address}`, { replace: true });
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

<svelte:head>
  <title>Radicle: {query}</title>
</svelte:head>

<main class="off-centered">
  {#if error}
    <Error on:close={() => navigate('/')}>
      Invalid query string “{query}”
    </Error>
  {:else}
    <Loading center />
  {/if}
</main>
