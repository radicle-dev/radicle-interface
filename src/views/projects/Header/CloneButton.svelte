<script lang="ts">
  import type { BaseUrl } from "@httpd-client";

  import { parseRepositoryId } from "@app/lib/utils";
  import { config } from "@app/lib/config";

  import Command from "@app/components/Command.svelte";
  import Floating from "@app/components/Floating.svelte";
  import SquareButton from "@app/components/SquareButton.svelte";
  import Icon from "@app/components/Icon.svelte";

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
  .dropdown {
    border: 1px solid var(--color-border-hint);
    background-color: var(--color-background-float);
    border-radius: var(--border-radius-small);
    box-shadow: var(--elevation-low);
    margin-top: 0.5rem;
    padding: 1rem;
    position: absolute;
    width: 26rem;
    z-index: 10;
    right: 8rem;
  }

  label {
    display: block;
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-regular);
    margin-bottom: 0.75rem;
  }

  @media (max-width: 720px) {
    .dropdown {
      width: auto;
      left: 2rem;
      right: 2rem;
      z-index: 10;
    }
  }
</style>

<Floating>
  <div slot="toggle">
    <SquareButton size="large" variant="primary">
      Clone
      <svelte:fragment slot="icon-right">
        <Icon name="download" />
      </svelte:fragment>
    </SquareButton>
  </div>
  <svelte:fragment slot="modal">
    <div class="dropdown">
      <div style:margin-bottom="1.5rem">
        <label for="rad-clone-url">
          Use the <a
            target="_blank"
            rel="noreferrer"
            href="https://radicle.xyz/#try"
            class="txt-link txt-bold">
            Radicle CLI
          </a>
          to clone this project.
        </label>
        <Command command={radCloneUrl} />
      </div>

      <div>
        <label for="git-clone-url">Use Git to clone this repository.</label>
        <Command command={gitCloneUrl} />
      </div>
    </div>
  </svelte:fragment>
</Floating>
