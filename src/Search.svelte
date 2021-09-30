<script lang="ts">
  import { navigate } from 'svelte-routing';

  let input = "";
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      navigate(`/resolver/query?${
        new URLSearchParams({ q: input })
      }`);
    }
  };
</script>

<style>
  input {
    height: 100%;
    width: 100%;
    font-size: 0.875rem;
    text-overflow: ellipsis;
    margin: 0;
    padding:  0.5rem 1.25rem;
    border-style: dashed;
  }
</style>

<input
    size="40"
    type="text"
    bind:value={input}
    on:keydown={handleKeydown}
    placeholder="Search a name or address..." />
