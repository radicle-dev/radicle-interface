<script lang="ts">
  // Is not as good as crypto.randomUUID() but we need some kind of fallback
  const id = self.crypto.randomUUID
    ? self.crypto.randomUUID()
    : new Date().getTime().toString();

  export let checked: boolean;
</script>

<style>
  .toggle input[type="checkbox"] {
    display: none;
  }

  .toggle label {
    background-color: var(--color-background-dip);
    border: 1px solid var(--color-foreground-6);
    border-radius: var(--border-radius-round);
    cursor: pointer;
    display: block;
    position: relative;
    transition: transform ease-in-out 0.2s;
    width: 2.5rem;
    height: 1.5rem;
  }

  .toggle label::after {
    background-color: var(--color-fill-gray);
    border-radius: var(--border-radius-round);
    content: " ";
    cursor: pointer;
    display: inline-block;
    position: absolute;
    left: 3px;
    top: 3px;
    transition: transform ease-in-out 0.2s;
    width: 1rem;
    height: 1rem;
  }

  .toggle input[type="checkbox"]:checked ~ label {
    background-color: var(--color-background-dip);
    border-color: var(--color-border-default);
  }

  .toggle input[type="checkbox"]:checked ~ label::after {
    background-color: var(--color-fill-gray);
    transform: translateX(15px);
  }
</style>

<div class="toggle">
  <input type="checkbox" bind:checked on:change {id} />
  <label for={id} />
</div>
