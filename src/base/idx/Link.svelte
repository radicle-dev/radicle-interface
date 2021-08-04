<script lang="ts">
  import { onMount } from 'svelte';
  import type { Config } from '@app/config';
  import { Caip10Link } from '@ceramicnetwork/stream-caip10-link';
  import { EthereumAuthProvider } from '@ceramicnetwork/blockchain-utils-linking';

  export let did: string;
  export let caip10: string;
  export let config: Config;

  onMount(async () => {
    if (config.signer) {
      const address = await config.signer.getAddress();
      const ethAuthProvider = new EthereumAuthProvider(
        // TODO: Using the window.ethereum provider here since the config provider is throwing error.
        window.ethereum, address
      );

      const accountLink = await Caip10Link.fromAccount(config.ceramic.client, caip10.toLowerCase());
      await accountLink.setDid(
        did,
        ethAuthProvider
      );

    }
  });
</script>
