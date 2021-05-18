<script lang="typescript">
  import { navigate } from 'svelte-routing';

  let input: string = "";
  const search = () => {
    navigate(`/resolve?${
      new URLSearchParams({ q: input })
    }`);
  };
</script>

<main>
  <input size="40" type="text" bind:value={input} placeholder="Enter a name, address or domain..." />
  <button class="primary" on:click={search} disabled={!input}>
    Search
  </button>
</main>
