<script lang="ts">
  import * as modal from "@app/lib/modal";
  import { experimental } from "@app/lib/appearance";
  import { httpdStore, api } from "@app/lib/httpd";

  import Button from "@app/components/Button.svelte";
  import Command from "@app/components/Command.svelte";
  import ErrorModal from "@app/modals/ErrorModal.svelte";
  import ExternalLink from "@app/components/ExternalLink.svelte";
  import IconSmall from "@app/components/IconSmall.svelte";
  import Popover from "@app/components/Popover.svelte";

  export let projectId: string;
  export let seedCount: number;
  export let seeding: boolean;

  let editSeedingInProgress = false;

  async function editSeeding() {
    if ($httpdStore.state === "authenticated") {
      try {
        editSeedingInProgress = true;
        if (seeding) {
          await api.stopSeedingById(projectId, $httpdStore.session.id);
        } else {
          await api.seedById(projectId, $httpdStore.session.id);
        }
        seeding = !seeding;
      } catch (error) {
        if (error instanceof Error) {
          modal.show({
            component: ErrorModal,
            props: {
              title: seeding
                ? "Stop seeding repository failed"
                : "Seeding repository failed",
              subtitle: [
                `There was an error while trying to ${
                  seeding ? "stop seeding" : "seed"
                } this repository.`,
                "Check your radicle-httpd logs for details.",
              ],
              error: {
                message: error.message,
                stack: error.stack,
              },
            },
          });
        }
      } finally {
        editSeedingInProgress = false;
      }
    }
  }

  $: canEditSeeding =
    !editSeedingInProgress &&
    $httpdStore.state === "authenticated" &&
    $httpdStore.node.state === "running";
</script>

<style>
  .seed-label {
    display: block;
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-regular);
    margin-bottom: 0.75rem;
  }
  .title-counter {
    display: flex;
    gap: 0.5rem;
  }
  .counter {
    font-weight: var(--font-weight-regular);
    border-radius: var(--border-radius-tiny);
    background-color: var(--color-fill-ghost-hover);
    border: 1px solid var(--color-border-secondary-counter);
    color: var(--color-foreground-contrast);
    padding: 0 0.25rem;
  }
  .seeding {
    background-color: var(--color-fill-counter-emphasized);
    color: var(--color-foreground-emphasized);
  }
  .not-seeding {
    background-color: var(--color-fill-secondary-counter);
    color: var(--color-foreground-match-background);
  }
  .disabled {
    background-color: var(--color-fill-float-hover);
    color: var(--color-foreground-disabled);
  }
</style>

<Popover popoverPositionTop="2.5rem" popoverPositionRight="0">
  <Button
    slot="toggle"
    disabled={$experimental ? !canEditSeeding : false}
    let:toggle
    on:click={async () => {
      if ($experimental && !seeding && canEditSeeding) {
        await editSeeding();
      } else {
        toggle();
      }
    }}
    variant={seeding ? "secondary-toggle-on" : "secondary-toggle-off"}>
    <IconSmall name="seedling" />
    <span class="title-counter">
      {seeding ? "Seeding" : "Seed"}
      <span
        class="counter"
        class:seeding
        class:not-seeding={!seeding}
        class:disabled={$experimental ? !canEditSeeding : false}
        style:font-weight="var(--font-weight-regular)">
        {seedCount}
      </span>
    </span>
  </Button>

  <div
    slot="popover"
    style:width={$experimental ? (seeding ? "19.5rem" : "30.5rem") : "auto"}>
    {#if $experimental && canEditSeeding && seeding}
      <div class="seed-label txt-bold">Stop seeding</div>
      <div class="seed-label">
        Are you sure you want to stop seeding this repository? If you don't seed
        a repository it won't appear in the local repositories section anymore
        and any changes you make to it won't propagate to the network.
      </div>
      <Button
        styleWidth="100%"
        disabled={editSeedingInProgress}
        on:click={async () => {
          await editSeeding();
        }}>
        <IconSmall name="seedling" />
        Stop seeding
      </Button>
    {:else}
      <span class="seed-label">
        Use the <ExternalLink href="https://radicle.xyz">
          Radicle CLI
        </ExternalLink> to {seeding ? "stop" : "start"} seeding this repository.
      </span>
      <Command command={`rad ${seeding ? "unseed" : "seed"} ${projectId}`} />
    {/if}
  </div>
</Popover>
