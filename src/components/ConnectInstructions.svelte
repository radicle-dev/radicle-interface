<script>
  import Command from "@app/components/Command.svelte";
  import ExternalLink from "./ExternalLink.svelte";
</script>

<style>
  .divider {
    height: 1px;
    width: 100%;
    background-color: var(--color-fill-separator);
    margin: 1rem 0;
  }

  .heading {
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-bold);
    margin-bottom: 0.75rem;
  }

  .label {
    display: block;
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-regular);
    margin-bottom: 0.75rem;
  }
</style>

<div>
  <div class="heading">Browse your local repositories</div>
  <div class="label">
    To browse repositories on your local node, run the following command.
  </div>
  <Command fullWidth command="radicle-httpd" />

  <div class="divider" />
  <div class="heading">New to Radicle?</div>
  <div class="label">
    Visit <ExternalLink href="https://radicle.xyz/#try" /> to download Radicle and
    get started.
  </div>
</div>
