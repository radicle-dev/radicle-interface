<script lang="ts">
  import type { BaseUrl, Embed, Project } from "@httpd-client";

  import * as modal from "@app/lib/modal";
  import * as router from "@app/lib/router";
  import * as utils from "@app/lib/utils";
  import { HttpdClient } from "@httpd-client";
  import { embed } from "@app/lib/file";
  import { httpdStore } from "@app/lib/httpd";

  import AssigneeInput from "@app/views/projects/Cob/AssigneeInput.svelte";
  import AuthenticationErrorModal from "@app/modals/AuthenticationErrorModal.svelte";
  import Badge from "@app/components/Badge.svelte";
  import Button from "@app/components/Button.svelte";
  import CobHeader from "@app/views/projects/Cob/CobHeader.svelte";
  import ErrorMessage from "@app/components/ErrorMessage.svelte";
  import InlineMarkdown from "@app/components/InlineMarkdown.svelte";
  import LabelInput from "@app/views/projects/Cob/LabelInput.svelte";
  import Layout from "@app/views/projects/Layout.svelte";
  import Markdown from "@app/components/Markdown.svelte";
  import NodeId from "@app/components/NodeId.svelte";
  import TextInput from "@app/components/TextInput.svelte";
  import Textarea from "@app/components/Textarea.svelte";

  export let baseUrl: BaseUrl;
  export let project: Project;
  export let rawPath: (commit?: string) => string;

  let preview: boolean = false;
  let selectionStart = 0;
  let selectionEnd = 0;

  let issueTitle = "";
  let issueText = "";
  let assignees: string[] = [];
  let labels: string[] = [];

  let creatingIssue: boolean = false;

  const api = new HttpdClient(baseUrl);
  const newEmbeds = new Map<string, Embed>();

  function handleFileDrop(event: { detail: DragEvent }) {
    event.detail.preventDefault();
    if (event.detail.dataTransfer) {
      const embeds = Array.from(event.detail.dataTransfer.files).map(embed);
      void Promise.all(embeds).then(embeds =>
        embeds.forEach(({ oid, name, content }) => {
          newEmbeds.set(oid, { name, content });
          const embedText = `![${name}](${oid})\n`;
          issueText = issueText
            .slice(0, selectionStart)
            .concat(embedText, issueText.slice(selectionEnd));
          selectionStart += embedText.length;
          selectionEnd = selectionStart;
        }),
      );
    }
  }

  async function createIssue(sessionId: string) {
    try {
      const result = await api.project.createIssue(
        project.id,
        {
          title: issueTitle,
          description: issueText,
          assignees: assignees,
          embeds: [...newEmbeds.values()],
          labels: labels,
        },
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

  $: valid = issueTitle && issueText;
  $: session =
    $httpdStore.state === "authenticated" && utils.isLocal(baseUrl.hostname)
      ? $httpdStore.session
      : undefined;
</script>

<style>
  .form {
    display: flex;
    flex: 1;
    padding: 1rem;
  }
  .actions {
    display: flex;
    justify-content: flex-end;
    flex-direction: row;
    gap: 1rem;
    margin-top: 1rem;
  }
  .metadata {
    display: flex;
    flex-direction: column;
    font-size: var(--font-size-small);
    padding: 1rem;
    margin-left: 3rem;
    border: 1px solid var(--color-border-hint);
    background-color: var(--color-background-float);
    border-radius: var(--border-radius-small);
    height: fit-content;
    gap: 1.5rem;
    width: 20rem;
  }
  .editor {
    flex: 2;
  }
  .author {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>

<Layout {baseUrl} {project} activeTab="issues">
  <div>
    {#if session}
      <div class="form">
        <div class="editor">
          <CobHeader>
            <svelte:fragment slot="title">
              {#if !preview}
                <TextInput
                  placeholder="Title"
                  bind:value={issueTitle}
                  showKeyHint={false} />
              {:else if issueTitle}
                <InlineMarkdown fontSize="medium" content={issueTitle} />
              {:else}
                <span class="txt-missing">No title</span>
              {/if}
            </svelte:fragment>
            <svelte:fragment slot="state">
              {#if preview}
                <Badge size="small" variant="positive">open</Badge>
              {/if}
            </svelte:fragment>
            <svelte:fragment slot="description">
              {#if !preview}
                <Textarea
                  bind:selectionStart
                  bind:selectionEnd
                  on:drop={handleFileDrop}
                  bind:value={issueText}
                  on:submit={async () => {
                    if (valid && session) {
                      creatingIssue = true;
                      try {
                        await createIssue(session.id);
                      } finally {
                        creatingIssue = false;
                      }
                    }
                  }}
                  placeholder="Write a description" />
              {:else if !issueText}
                <p class="txt-missing">No description</p>
              {:else}
                <Markdown
                  rawPath={rawPath(project.head)}
                  embeds={newEmbeds}
                  content={issueText} />
              {/if}
            </svelte:fragment>
            <div class="author" slot="author">
              {#if preview}
                opened by <NodeId
                  nodeId={session.publicKey}
                  alias={session.alias} /> now
              {/if}
            </div>
          </CobHeader>
          <div class="actions">
            <Button
              disabled={creatingIssue}
              variant="none"
              on:click={() => (preview = !preview)}>
              {#if preview}
                Resume editing
              {:else}
                Preview
              {/if}
            </Button>
            <Button
              disabled={!valid || creatingIssue}
              variant="secondary"
              on:click={async () => {
                if (session) {
                  creatingIssue = true;
                  try {
                    await createIssue(session.id);
                  } finally {
                    creatingIssue = false;
                  }
                }
              }}>
              Submit
            </Button>
          </div>
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
  </div>
</Layout>
