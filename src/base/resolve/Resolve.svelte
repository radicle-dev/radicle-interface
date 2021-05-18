<script lang="typescript">
  import { onMount } from 'svelte';
  import { ethers } from 'ethers';
  import { navigate } from 'svelte-routing';
  import type { Config } from '@app/config';
  import * as utils from '@app/utils';

  export let config: Config;
  export let query: string | null;

  onMount(() => {
    if (query) {
      if (ethers.utils.isAddress(query)) {
        // Go to org.
        navigate(`/orgs/${query}`, { replace: true });
      } else if (utils.isRadicleId(query)) {
        // Go to Radicle entity.
        alert("Radicle IDs are not yet supported");
      } else {
        let label = utils.parseEnsLabel(query, config);
        navigate(`/registrations/${label}`, { replace: true });
      }
    } else {
      navigate('/');
    }
  });
</script>
