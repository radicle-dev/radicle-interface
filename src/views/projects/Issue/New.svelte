<script lang="ts">
  import type { BaseUrl, Project } from "@httpd-client";
  import type { EmbedWithOid } from "@app/lib/file";

  import * as modal from "@app/lib/modal";
  import * as router from "@app/lib/router";
  import { HttpdClient } from "@httpd-client";
  import { embed } from "@app/lib/file";
  import { authenticatedLocal, httpdStore } from "@app/lib/httpd";

  import AssigneeInput from "@app/views/projects/Cob/AssigneeInput.svelte";
  import AuthenticationErrorModal from "@app/modals/AuthenticationErrorModal.svelte";
  import NodeId from "@app/components/NodeId.svelte";
  import Badge from "@app/components/Badge.svelte";
  import Button from "@app/components/Button.svelte";
  import CobHeader from "@app/views/projects/Cob/CobHeader.svelte";
  import ErrorMessage from "@app/components/ErrorMessage.svelte";
  import LabelInput from "@app/views/projects/Cob/LabelInput.svelte";
  import Layout from "@app/views/projects/Layout.svelte";
  import Markdown from "@app/components/Markdown.svelte";
  import Textarea from "@app/components/Textarea.svelte";
  import Icon from "@app/components/Icon.svelte";

  export let baseUrl: BaseUrl;
  export let project: Project;
  export let tracking: boolean;

  let newEmbeds: EmbedWithOid[] = [];
  let preview: boolean = false;
  let selectionStart = 0;
  let selectionEnd = 0;

  let issueTitle = "";
  let issueText = "";
  let assignees: string[] = [];
  let labels: string[] = [];

  const api = new HttpdClient(baseUrl);

  function handleFileDrop(event: { detail: DragEvent }) {
    event.detail.preventDefault();
    if (event.detail.dataTransfer) {
      const embeds = Array.from(event.detail.dataTransfer.files).map(embed);
      void Promise.all(embeds).then(embeds =>
        embeds.forEach(({ oid, name, content }) => {
          newEmbeds = [
            ...newEmbeds,
            { oid: oid, name: name, content: content },
          ];
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
</script>

<style>
  .form {
    display: grid;
    grid-template-columns: minmax(0, 3fr) 1fr;
    margin-bottom: 1rem;
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
    gap: 2rem;
    font-size: var(--font-size-small);
    padding-left: 1rem;
    margin-left: 1rem;
  }
  .editor {
    flex: 2;
    padding-right: 1rem;
  }
  .open {
    color: var(--color-fill-success);
  }
  .author {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  @media (max-width: 720px) {
    .form {
      grid-template-columns: minmax(0, 1fr);
    }
    .editor {
      padding-right: 0;
    }
    .metadata {
      margin-left: 0;
      padding-left: 0;
      gap: 2rem;
    }
  }
</style>

<Layout {baseUrl} {project} {tracking} activeTab="issues">
  <main>
    {#if $httpdStore.state === "authenticated"}
      {@const session = $httpdStore.session}
      <div class="form">
        <div class="editor">
          <CobHeader
            mode="readWrite"
            {preview}
            locallyAuthenticated={$authenticatedLocal(baseUrl.hostname)}
            bind:title={issueTitle}>
            <svelte:fragment slot="icon">
              <div class="open">
                <Icon name="issue" />
              </div>
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
                  on:submit={() => {
                    if (valid) {
                      void createIssue(session.id);
                    }
                  }}
                  placeholder="Write a description" />
              {:else if !issueText}
                <p class="txt-missing">No description</p>
              {:else}
                <Markdown embeds={newEmbeds} content={issueText} />
              {/if}
            </svelte:fragment>
            <div class="author" slot="author">
              {#if preview}
                opened by <NodeId
                  nodeId={$httpdStore.session.publicKey}
                  alias={$httpdStore.session.alias} /> now
              {/if}
            </div>
          </CobHeader>
          <div class="actions">
            <Button variant="none" on:click={() => (preview = !preview)}>
              {#if preview}
                Resume editing
              {:else}
                Preview
              {/if}
            </Button>
            <Button
              disabled={!valid}
              variant="secondary"
              on:click={() => void createIssue(session.id)}>
              Submit
            </Button>
          </div>
        </div>
        <div class="metadata">
          <AssigneeInput
            hideEditIcon
            mode="readWrite"
            locallyAuthenticated={$authenticatedLocal(baseUrl.hostname)}
            on:save={({ detail: updatedAssignees }) =>
              (assignees = updatedAssignees)} />
          <LabelInput
            hideEditIcon
            mode="readWrite"
            locallyAuthenticated={$authenticatedLocal(baseUrl.hostname)}
            on:save={({ detail: updatedLabels }) => (labels = updatedLabels)} />
        </div>
      </div>
    {:else}
      <ErrorMessage
        message="Couldn't access issue creation. Make sure you're authenticated." />
    {/if}
  </main>
</Layout>
