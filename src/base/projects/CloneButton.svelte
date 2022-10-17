<script lang="ts">
  import * as utils from "@app/utils";
  import Clipboard from "@app/Clipboard.svelte";
  import Floating from "@app/Floating.svelte";
  import { closeFocused } from "@app/Floating.svelte";

  export let seedHost: string;
  export let urn: string;

  $: radCloneUrl = `rad clone rad://${seedHost}/${utils.parseRadicleId(urn)}`;
  $: gitCloneUrl = `https://${seedHost}/${utils.parseRadicleId(urn)}.git`;
</script>

<style>
  .clone-button {
    background-color: var(--color-caution-2);
    border-radius: var(--border-radius-small);
    color: var(--color-caution-6);
    font-family: var(--font-family-monospace);
    min-width: max-content;
    height: 2rem;
    line-height: initial;
    padding: 0.5rem 0.75rem;
  }
  .clone-button:hover {
    background-color: var(--color-caution-3);
  }
  .dropdown {
    background-color: var(--color-foreground-1);
    border-radius: var(--border-radius-small);
    box-shadow: var(--elevation-low);
    margin-top: 0.5rem;
    padding: 1rem;
    position: absolute;
    width: 24rem;
    z-index: 10;
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
    color: var(--color-foreground-6);
    display: block;
    font-size: var(--font-size-tiny);
    padding: 0.5rem 0.5rem 0 0.25rem;
  }
  .clone-url-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }
  .clone-url {
    border-radius: var(--border-radius-small);
    font-family: var(--font-family-monospace);
    font-size: var(--font-size-tiny);
    height: 2rem;
    overflow: hidden;
    padding: 0.5rem;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.4;
    color: var(--color-caution-6);
    background: linear-gradient(var(--color-caution-2), var(--color-caution-2)),
      linear-gradient(var(--color-background), var(--color-background));
  }
  .clipboard {
    position: absolute;
    right: 0;
    color: var(--color-caution-6);
    background: linear-gradient(var(--color-caution-2), var(--color-caution-2)),
      linear-gradient(var(--color-background), var(--color-background));
    visibility: hidden;
    width: 4rem;
    height: 2rem;
    text-align: right;
    -webkit-mask: linear-gradient(90deg, transparent 0%, #fff 50%);
    mask: linear-gradient(90deg, transparent 0%, #fff 50%);
    border-radius: 0 var(--border-radius-small) var(--border-radius-small) 0;
  }
  .clone-url-wrapper:hover .clipboard {
    visibility: visible;
  }
</style>

<Floating>
  <div slot="toggle" class="clone-button">Clone</div>
  <svelte:fragment slot="modal">
    <div class="dropdown">
      <div class="clone-url-wrapper">
        <div class="clone-url" name="rad-clone-url">{radCloneUrl}</div>
        <span class="clipboard">
          <Clipboard text={radCloneUrl} on:copied={closeFocused} />
        </span>
      </div>
      <label for="rad-clone-url">
        Use the <a
          target="_blank"
          rel="noreferrer"
          href="https://radicle.xyz/get-started.html"
          class="link">
          Radicle CLI
        </a>
        to clone this project.
      </label>
      <br />
      <div class="clone-url-wrapper">
        <div class="clone-url" name="git-clone-url">{gitCloneUrl}</div>
        <span class="clipboard">
          <Clipboard text={gitCloneUrl} on:copied={closeFocused} />
        </span>
      </div>
      <label for="git-clone-url">
        Use Git to clone this repository from the URL above.
      </label>
    </div>
  </svelte:fragment>
</Floating>
