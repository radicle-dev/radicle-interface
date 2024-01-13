<script lang="ts">
  import type { BaseUrl, Project } from "@httpd-client";

  import * as modal from "@app/lib/modal";
  import capitalize from "lodash/capitalize";
  import { twemoji } from "@app/lib/utils";
  import { httpdStore, api } from "@app/lib/httpd";

  import Badge from "@app/components/Badge.svelte";
  import CloneButton from "../Header/CloneButton.svelte";
  import ErrorModal from "@app/modals/ErrorModal.svelte";
  import InlineMarkdown from "@app/components/InlineMarkdown.svelte";
  import Link from "@app/components/Link.svelte";
  import SeedButton from "../Header/SeedButton.svelte";
  import CopyableId from "@app/components/CopyableId.svelte";

  export let project: Project;
  export let baseUrl: BaseUrl;
  export let seeding: boolean;

  let editSeedingInProgress = false;

  async function editSeeding() {
    if ($httpdStore.state === "authenticated") {
      try {
        editSeedingInProgress = true;
        if (seeding) {
          await api.stopSeedingById(project.id, $httpdStore.session.id);
        } else {
          await api.seedById(project.id, $httpdStore.session.id);
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

  $: session =
    $httpdStore.state === "authenticated" ? $httpdStore.session : undefined;
</script>

<style>
  .title {
    align-items: center;
    gap: 0.5rem;
    color: var(--color-foreground-contrast);
    display: flex;
    font-size: var(--font-size-large);
    justify-content: left;
    text-align: left;
    text-overflow: ellipsis;
    padding: 1rem 1rem 0 1rem;
  }
  .description {
    padding: 0 1rem 1rem 1rem;
  }
  .project-name:hover {
    color: inherit;
  }
  .description :global(a) {
    border-bottom: 1px solid var(--color-foreground-contrast);
  }
  .id {
    padding-left: 1rem;
  }
  .title-container {
    display: flex;
    flex-direction: column;
    gap: 0rem;
    margin-bottom: 1rem;
  }
</style>

<div class="title-container">
  <div class="title">
    <span class="txt-overflow">
      <Link
        route={{
          resource: "project.source",
          project: project.id,
          node: baseUrl,
        }}>
        <span class="project-name">
          {project.name}
        </span>
      </Link>
    </span>
    {#if project.visibility && project.visibility.type === "private"}
      <Badge variant="yellowOutline" size="tiny">
        {capitalize(project.visibility.type)}
      </Badge>
    {/if}
    <div
      class="global-hide-on-mobile"
      style="margin-left: auto; display: flex; gap: 0.5rem;">
      <SeedButton
        {seeding}
        disabled={editSeedingInProgress}
        editSeeding={session && editSeeding}
        seedCount={project.seeding}
        projectId={project.id} />
      <CloneButton {baseUrl} id={project.id} name={project.name} />
    </div>
  </div>
  <div class="id">
    <CopyableId id={project.id} />
  </div>
</div>
<div class="description" use:twemoji>
  <InlineMarkdown fontSize="regular" content={project.description} />
</div>
