<script lang="ts">
  import type { BaseUrl } from "@httpd-client";

  import { parseRepositoryId } from "@app/lib/utils";
  import { config } from "@app/lib/config";

  import Button from "@app/components/Button.svelte";
  import Command from "@app/components/Command.svelte";
  import Popover from "@app/components/Popover.svelte";
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
  label {
    display: block;
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-regular);
    margin-bottom: 0.75rem;
  }
</style>

<Popover popoverPositionTop="3rem" popoverPositionRight="0">
  <Button
    slot="toggle"
    let:toggle
    on:click={toggle}
    size="large"
    variant="secondary">
    Clone
    <Icon name="download" />
  </Button>

  <div slot="popover" style:width="24rem">
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
</Popover>
