<script lang="ts">
  import * as modal from "@app/lib/modal";
  import { httpdStore, api } from "@app/lib/httpd";

  import Button from "@app/components/Button.svelte";
  import ErrorModal from "@app/modals/ErrorModal.svelte";
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
                ? "Stop seeding project failed"
                : "Seeding project failed",
              subtitle: [
                `There was an error while trying to ${
                  seeding ? "stop seeding" : "seed"
                } this project.`,
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
    background-color: var(--color-fill-secondary-counter);
    border: 1px solid var(--color-border-secondary-counter);
    color: var(--color-foreground-match-background);
    padding: 0 0.25rem;
  }
  .seeding {
    background-color: var(--color-fill-counter-emphasized);
    color: var(--color-foreground-emphasized);
  }
  .disabled {
    background-color: var(--color-fill-ghost-hover);
    color: var(--color-foreground-disabled);
  }
</style>

<Popover popoverPositionTop="2.5rem" popoverPositionRight="0">
  <Button
    disabled={!canEditSeeding}
    slot="toggle"
    let:toggle
    on:click={async () => {
      if (!seeding && canEditSeeding) {
        await editSeeding();
      } else {
        toggle();
      }
    }}
    variant={seeding ? "secondary-toggle-on" : "secondary-toggle-off"}>
    <IconSmall name="network" />
    <span class="title-counter">
      {seeding ? "Seeding" : "Seed"}
      <span
        class="counter"
        class:seeding
        class:disabled={!canEditSeeding}
        style:font-weight="var(--font-weight-regular)">
        {seedCount}
      </span>
    </span>
  </Button>

  <div slot="popover" let:toggle style:width={seeding ? "19.5rem" : "30.5rem"}>
    <div class="seed-label txt-bold">Stop seeding</div>
    <div class="seed-label">
      Are you sure you want to stop seeding this project? If you don't seed a
      project it won't appear in the local projects section anymore and any
      changes you make to it won't propagate to the network.
    </div>
    <Button
      styleWidth="100%"
      disabled={editSeedingInProgress}
      on:click={async () => {
        await editSeeding();
        toggle();
      }}>
      <IconSmall name="network" />
      Stop seeding
    </Button>
  </div>
</Popover>
