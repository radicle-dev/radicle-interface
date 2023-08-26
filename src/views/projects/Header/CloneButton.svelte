<script lang="ts">
  import type { BaseUrl } from "@httpd-client";

  import { parseRepositoryId } from "@app/lib/utils";
  import { config } from "@app/lib/config";

  import Floating from "@app/components/Floating.svelte";
  import Clipboard from "@app/components/Clipboard.svelte";

  export let baseUrl: BaseUrl;
  export let id: string;
  export let name: string;

  $: radCloneUrl = `rad clone ${id}`;
  $: portFragment =
    baseUrl.scheme === config.nodes.defaultHttpdScheme &&
    baseUrl.port === config.nodes.defaultHttpdPort
      ? ""
      : `:${baseUrl.port}`;
  $: gitCloneUrl = `git clone ${baseUrl.scheme}://${
    baseUrl.hostname
  }${portFragment}/${parseRepositoryId(id)?.pubkey ?? id}.git ${name}`;
</script>

<style>
  .clone-button {
    background-color: var(--color-fill-primary);
    border-radius: var(--border-radius-small);
    color: var(--color-foreground-match-background);
    font-family: var(--font-family-sans-serif);
    font-weight: var(--font-weight-medium);
    min-width: max-content;
    height: 2rem;
    line-height: initial;
    padding: 0.5rem 0.75rem;
  }
  .clone-button:hover {
    background-color: var(--color-fill-primary-hover);
  }
  .dropdown {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border: 1px solid var(--color-border-hint);
    background-color: var(--color-background-float);
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
</style>

<Floating>
  <div slot="toggle" class="clone-button" role="button">Clone</div>
  <svelte:fragment slot="modal">
    <div class="dropdown">
      <label for="rad-clone-url">
        Use the <a
          target="_blank"
          rel="noreferrer"
          href="https://radicle.xyz/get-started.html"
          class="link">
          Radicle CLI
        </a>
        to clone this project:
      </label>
      <Clipboard withText text={radCloneUrl} />

      <br />
      <label for="git-clone-url">Use Git to clone this repository:</label>
      <Clipboard withText text={gitCloneUrl} />
    </div>
  </svelte:fragment>
</Floating>