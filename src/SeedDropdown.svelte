<script lang="ts">
  import { navigate } from "svelte-routing";
  import { Seed } from "@app/base/seeds/Seed";
  import type { Config } from "@app/config";
  import Dropdown from "@app/Dropdown.svelte";
  import type { SeedSession } from "@app/siwe";

  export let seeds: { [key: string]: SeedSession };
  export let visible = false;
  export let config: Config;

  // When a user signs into a new seed we want to update the seed listing
  $: formatSeeds = async () => {
    return await Promise.all(Object.values(seeds).map(async session => {
      let seed = await Seed.lookup(session.domain, config);
      let key = `${seed.emoji} ${seed.host}`;

      return { key, value: seed.host, badge: null };
    }));
  };
</script>

<style>
</style>

{#await formatSeeds() then items}
  <Dropdown
    {items}
    selected={null}
    {visible}
    on:select={(item) => {
      visible = false;
      navigate(`/seeds/${item.detail}`);
    }}
  />
{/await}
