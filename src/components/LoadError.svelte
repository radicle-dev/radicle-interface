<script lang="ts">
  import Command from "./Command.svelte";
  import ExternalLink from "./ExternalLink.svelte";
  import Icon from "./Icon.svelte";

  export let title: string;
  export let errorMessage: string;
  export let stackTrace: string;
</script>

<style>
  .wrapper {
    gap: 1.5rem;
  }

  .container {
    display: flex;
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .help {
    font-size: var(--font-size-small);
  }
</style>

<div class="wrapper layout-centered">
  <Icon name="desert" size="48" />
  <div class="container">
    <div class="txt-medium txt-bold">
      {title}
    </div>
    <div class="help">
      If you need help resolving this issue, copy the error message
      <br />
      below and send it to us on
      <ExternalLink href="https://radicle.zulipchat.com">
        radicle.zulipchat.com
      </ExternalLink>
    </div>
  </div>

  <div style:max-width="25rem">
    <Command
      command={JSON.stringify({ errorMessage, stackTrace })}
      fullWidth
      showPrompt={false} />
  </div>
</div>
