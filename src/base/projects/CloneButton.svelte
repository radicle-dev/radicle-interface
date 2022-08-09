<script lang="ts">
  import * as utils from "@app/utils";
  import Input from "@app/Input.svelte";
  import Floating from "@app/Floating.svelte";

  export let seedHost: string;
  export let urn: string;
</script>

<style>
  .clone-button {
    background-color: var(--color-yellow-background);
    border-radius: var(--border-radius-small);
    color: var(--color-yellow);
    cursor: pointer;
    font-family: var(--font-family-monospace);
    min-width: max-content;
    padding: 0.5rem 0.75rem;
    user-select: none;
  }
  .clone-button:hover {
    background-color: var(--color-foreground-background-lighter);
  }
  .dropdown {
    padding: 1rem;
    width: 24rem;
  }
  @media (max-width: 720px) {
    .dropdown {
      width: auto;
      left: 2rem;
      right: 2rem;
      z-index: 10;
    }
  }
  label {
    color: var(--color-foreground-faded);
    display: block;
    font-size: 0.75rem;
    padding: 0.5rem 0.5rem 0 0.25rem;
  }
</style>

<Floating>
  <div slot="toggle" class="clone-button">
    Clone
  </div>
  <svelte:fragment slot="modal">
    <div class="dropdown">
      <Input
        name="rad-clone-url"
        value="rad clone rad://{seedHost}/{utils.parseRadicleId(urn)}"
        class="yellow"
        clipboard />
      <label for="rad-clone-url">
        Use the <a
          target="_blank"
          href="https://radicle.network/get-started.html"
          class="link">Radicle CLI</a> to clone this project.
      </label>
      <br />
      <Input
        name="git-clone-url"
        value="https://{seedHost}/{utils.parseRadicleId(urn)}.git"
        class="yellow"
        clipboard />
      <label for="git-clone-url"
        >Use Git to clone this repository from the URL above.</label>
    </div>
  </svelte:fragment>
</Floating>
