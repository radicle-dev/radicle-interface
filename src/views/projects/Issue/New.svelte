<script lang="ts">
  import type { BaseUrl, Embed, Node, Project, Reaction } from "@http-client";

  import * as modal from "@app/lib/modal";
  import * as router from "@app/lib/router";
  import * as utils from "@app/lib/utils";
  import { HttpdClient } from "@http-client";
  import { httpdStore } from "@app/lib/httpd";

  import AssigneeInput from "@app/views/projects/Cob/AssigneeInput.svelte";
  import ErrorModal from "@app/modals/ErrorModal.svelte";
  import CobHeader from "@app/views/projects/Cob/CobHeader.svelte";
  import ErrorMessage from "@app/components/ErrorMessage.svelte";
  import ExtendedTextarea from "@app/components/ExtendedTextarea.svelte";
  import LabelInput from "@app/views/projects/Cob/LabelInput.svelte";
  import Layout from "@app/views/projects/Layout.svelte";
  import TextInput from "@app/components/TextInput.svelte";

  export let baseUrl: BaseUrl;
  export let node: Node;
  export let project: Project;
  export let rawPath: (commit?: string) => string;

  let issueTitle = "";
  let assignees: Reaction["authors"] = [];
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
        {
          title,
          description,
          assignees: assignees.map(a => a.id),
          embeds: [...embeds.values()],
          labels,
        },
        sessionId,
      );

      void router.push({
        resource: "project.issue",
        project: project.id,
        node: baseUrl,
        issue: result.id,
      });
    } catch (error) {
      if (error instanceof Error) {
        modal.show({
          component: ErrorModal,
          props: {
            title: "Coult not create issue",
            subtitle: [
              "There was an error while updating the issue.",
              "Make sure you're authenticated.",
              "Check your radicle-httpd logs for details.",
            ],
            error: {
              message: error.message,
              stack: error.stack,
            },
          },
        });
      } else {
        console.error(error);
      }
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

<Layout {node} {baseUrl} {project} activeTab="issues">
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
              disallowEmptyBody
              isValid={() => issueTitle.length > 0}
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
          locallyAuthenticated={session &&
            project.delegates
              .map(d => d.id)
              .includes(`did:key:${session.publicKey}`)}
          on:save={({ detail: updatedAssignees }) =>
            (assignees = updatedAssignees)} />
        <LabelInput
          locallyAuthenticated={session &&
            project.delegates
              .map(d => d.id)
              .includes(`did:key:${session.publicKey}`)}
          on:save={({ detail: updatedLabels }) => (labels = updatedLabels)} />
      </div>
    </div>
  {:else}
    <ErrorMessage
      title="Not able to create a new issue"
      description="Couldn't access issue creation. Make sure you're authenticated." />
  {/if}
</Layout>
