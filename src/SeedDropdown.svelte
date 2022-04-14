<script lang="ts">
  import { navigate } from "svelte-routing";
  import { Seed } from "@app/base/seeds/Seed";
  import type { Config } from "@app/config";
  import Dropdown from "@app/Dropdown.svelte";
  import type { SeedSession } from "@app/siwe";

  export let seeds: { [key: string]: SeedSession };
  export let seedDropdown = false;
  export let toggleDropdown: () => void;
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
  .selector {
    margin-left: 2rem;
  }
</style>

<div class="selector">
  <span>
    <button class="seed outline small" on:click={toggleDropdown}>
      Seeds
    </button>
    {#await formatSeeds() then items}
      <Dropdown
        {items}
        selected={null}
        visible={seedDropdown}
        on:select={(item) => {
          seedDropdown = false;
          navigate(`/seeds/${item.detail}`);
        }}
      />
    {/await}
  </span>
</div>
