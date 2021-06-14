<script lang="typescript">
  import { navigate } from 'svelte-routing';

  let input = "";
  const search = () => {
    navigate(`/resolver/query?${
      new URLSearchParams({ q: input })
    }`);
  };
</script>

<main class="centered">
  <div>
    <input size="40" type="text" bind:value={input} placeholder="Enter a name, address or domain..." />
    <button class="primary" on:click={search} disabled={!input}>
      Search
    </button>
  </div>
</main>
