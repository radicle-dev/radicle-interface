<script lang="ts">
  import { navigate } from "svelte-routing";
  import { Seed } from "@app/base/seeds/Seed";
  import type { Config } from "@app/config";
  import Dropdown from "@app/Dropdown.svelte";
  import type { SeedSession } from "@app/siwe";
  import { closeFocused } from "@app/Floating.svelte";

  export let seeds: { [key: string]: SeedSession };
  export let config: Config;

  // When a user signs into a new seed we want to update the seed listing
  $: formatSeeds = async () => {
    return await Promise.all(
      Object.values(seeds).map(async session => {
        const seed = await Seed.lookup(session.domain, config);
        const key = `${seed.emoji} ${seed.host}`;

        return {
          key,
          value: seed.host,
          title: `Go to ${seed.host}`,
          badge: null,
        };
      }),
    );
  };
</script>

{#await formatSeeds() then items}
  <Dropdown
    {items}
    selected={null}
    on:select={item => {
      closeFocused();
      navigate(`/seeds/${item.detail}`);
    }} />
{/await}
