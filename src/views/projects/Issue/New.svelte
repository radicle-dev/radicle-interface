<script lang="ts">
  import type { BaseUrl, Embed, Project } from "@httpd-client";

  import * as modal from "@app/lib/modal";
  import * as router from "@app/lib/router";
  import * as utils from "@app/lib/utils";
  import { HttpdClient } from "@httpd-client";
  import { httpdStore } from "@app/lib/httpd";

  import AssigneeInput from "@app/views/projects/Cob/AssigneeInput.svelte";
  import AuthenticationErrorModal from "@app/modals/AuthenticationErrorModal.svelte";
  import CobHeader from "@app/views/projects/Cob/CobHeader.svelte";
  import ErrorMessage from "@app/components/ErrorMessage.svelte";
  import ExtendedTextarea from "@app/components/ExtendedTextarea.svelte";
  import LabelInput from "@app/views/projects/Cob/LabelInput.svelte";
  import Layout from "@app/views/projects/Layout.svelte";
  import TextInput from "@app/components/TextInput.svelte";

  export let baseUrl: BaseUrl;
  export let project: Project;
  export let rawPath: (commit?: string) => string;

  let issueTitle = "";
  let assignees: string[] = [];
  let labels: string[] = [];

  const api = new HttpdClient(baseUrl);

  async function createIssue(
    sessionId: string,
    title: string,
    description: string,
    embeds: Map<string, Embed>,
  ) {
    try {
      const result = await api.project.createIssue(
        project.id,
        { title, description, assignees, embeds: [...embeds.values()], labels },
        sessionId,
      );

      void router.push({
        resource: "project.issue",
        project: project.id,
        node: baseUrl,
        issue: result.id,
      });
    } catch {
      modal.show({
        component: AuthenticationErrorModal,
        props: {
          title: "Authentication failed",
          subtitle: [
            "Could not create the issue. Make sure you're still logged in.",
          ],
        },
      });
    }
  }

  $: session =
    $httpdStore.state === "authenticated" && utils.isLocal(baseUrl.hostname)
      ? $httpdStore.session
      : undefined;
</script>

<style>
  .form {
    display: flex;
    min-height: 100%;
  }
  .metadata {
    display: flex;
    flex-direction: column;
    font-size: var(--font-size-small);
    padding: 1rem;
    border-left: 1px solid var(--color-border-hint);
    gap: 1.5rem;
    width: 20rem;
  }
  .editor {
    flex: 2;
  }
</style>

<Layout {baseUrl} {project} activeTab="issues">
  {#if session}
    {@const session_ = session}
    <div class="form">
      <div class="editor" style="padding: 1rem;">
        <CobHeader>
          <svelte:fragment slot="title">
            <TextInput
              placeholder="Title"
              autofocus
              bind:value={issueTitle}
              showKeyHint={false} />
          </svelte:fragment>
          <svelte:fragment slot="description">
            <ExtendedTextarea
              rawPath={rawPath(project.head)}
              enableAttachments
              submitCaption="Submit"
              placeholder="Write a description"
              on:submit={async ({ detail: { comment, embeds } }) => {
                await createIssue(session_.id, issueTitle, comment, embeds);
              }}
              on:close={() => {
                void router.push({
                  resource: "project.issues",
                  project: project.id,
                  node: baseUrl,
                });
              }} />
          </svelte:fragment>
        </CobHeader>
      </div>
      <div class="metadata">
        <AssigneeInput
          locallyAuthenticated={Boolean(session)}
          on:save={({ detail: updatedAssignees }) =>
            (assignees = updatedAssignees)} />
        <LabelInput
          locallyAuthenticated={Boolean(session)}
          on:save={({ detail: updatedLabels }) => (labels = updatedLabels)} />
      </div>
    </div>
  {:else}
    <ErrorMessage
      message="Couldn't access issue creation. Make sure you're authenticated." />
  {/if}
</Layout>
