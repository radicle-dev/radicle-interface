<script lang="ts">
  import type { BaseUrl } from "@http-client";

  import config from "virtual:config";
  import { parseRepositoryId } from "@app/lib/utils";

  import Button from "@app/components/Button.svelte";
  import Command from "@app/components/Command.svelte";
  import ExternalLink from "@app/components/ExternalLink.svelte";
  import Icon from "@app/components/Icon.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Popover from "@app/components/Popover.svelte";
  import Radio from "@app/components/Radio.svelte";

  export let baseUrl: BaseUrl;
  export let id: string;
  export let name: string;

  let radicle: boolean = true;

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
  .popover {
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-regular);
  }
  label {
    display: block;
    margin-bottom: 0.75rem;
  }
</style>

<Popover popoverPositionTop="2.5rem" popoverPositionRight="0">
  <Button slot="toggle" let:toggle on:click={toggle} variant="outline">
    <span class="global-hide-on-small-desktop-down">Clone</span>
    <Icon name="download" />
  </Button>

  <div slot="popover" style:width="24rem" class="popover">
    <div style:margin-bottom="1.5rem">
      <Radio ariaLabel="Toggle render method">
        <Button
          styleWidth="100%"
          styleBorderRadius="0"
          variant={radicle ? "selected" : "not-selected"}
          on:click={() => {
            radicle = true;
          }}>
          <IconSmall name="logo" />
          Radicle
        </Button>
        <div class="global-spacer" />
        <Button
          styleWidth="100%"
          styleBorderRadius="0"
          variant={!radicle ? "selected" : "not-selected"}
          on:click={() => {
            radicle = false;
          }}>
          <IconSmall name="git" />
          Git
        </Button>
      </Radio>
    </div>

    {#if radicle}
      <label for="rad-clone-url">
        Use the <ExternalLink href="https://radicle.xyz">
          Radicle CLI
        </ExternalLink> to clone this repository.
      </label>
      <Command command={radCloneUrl} />
    {:else}
      <div>
        <label for="git-clone-url">
          If you don't have Radicle installed, you can still clone the
          repository via Git.
        </label>
        <Command command={gitCloneUrl} />
        <div style:margin-top="1.5rem">
          Note that a Git clone does not include any of the social artifacts
          such as issues or patches.
        </div>
      </div>
    {/if}
  </div>
</Popover>
