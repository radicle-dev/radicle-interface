<script lang="ts">
  import { link } from 'svelte-routing';
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
  .modal-floating {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  .modal-floating {
    z-index: 300;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .modal {
    position:absolute;
    top: 90px;
    right: 20px;
    padding: 2rem 3rem;
    border: 1px solid var(--color-secondary);
    font-family: var(--font-family-sans-serif);
    background: var(--color-background);
    box-shadow: 8px 8px 64px var(--box-shadow-color);
    width: 90%;
    border-radius: 10px;
    text-align: center;
  }
  .modal-title {
    color: var(--color-foreground);
    font-size: 1.25rem;
    font-weight: bold;
    line-height: 2.625rem;
    margin-bottom: 0.5rem;
    text-align: left;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  input {
    margin: 0;
    padding: 0;
    border: none;
    border-bottom: 2px white dashed;
    border-radius: 0;
    font-size: 1.25rem;
    font-weight: bold;
    line-height: 2.625rem;
  }
  input::placeholder {
    color: var(--color-foreground);
    font-size: 1.25rem;
    font-weight: bold;
    line-height: 2.625rem;
  }
</style>

<div class="modal-floating">
  <div class="modal">
    <div class="modal-title">
      <div>
        <input type="text" placeholder="Search a name or address" bind:value={input} on:keydown={handleKeydown} />
      </div>
      <div>
        <a use:link href="/orgs">
          Orgs
        </a>
      </div>
      <div>
        <a use:link href="/registrations">
          Register
        </a>
      </div>
    </div>
  </div>
</div>
