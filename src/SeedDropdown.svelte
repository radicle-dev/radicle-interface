<script lang="ts">
  import type { SeedSession } from "@app/siwe";

  import * as router from "@app/router";
  import Dropdown from "@app/Dropdown.svelte";
  import { Seed } from "@app/base/seeds/Seed";
  import { closeFocused } from "@app/Floating.svelte";

  export let seeds: { [key: string]: SeedSession };

  // When a user signs into a new seed we want to update the seed listing
  $: formatSeeds = async () => {
    return await Promise.all(
      Object.values(seeds).map(async session => {
        const seed = await Seed.lookup(session.domain);
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
      router.push({ resource: "seeds", params: { host: item.detail } });
    }} />
{/await}
