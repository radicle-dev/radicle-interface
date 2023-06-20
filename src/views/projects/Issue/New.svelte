<script lang="ts">
  import type { BaseUrl } from "@httpd-client";

  import * as modal from "@app/lib/modal";
  import * as router from "@app/lib/router";
  import * as utils from "@app/lib/utils";
  import { HttpdClient } from "@httpd-client";
  import { httpdStore } from "@app/lib/httpd";

  import AssigneeInput from "@app/views/projects/Cob/AssigneeInput.svelte";
  import AuthenticationErrorModal from "@app/views/session/AuthenticationErrorModal.svelte";
  import Authorship from "@app/components/Authorship.svelte";
  import Badge from "@app/components/Badge.svelte";
  import Button from "@app/components/Button.svelte";
  import CobHeader from "@app/views/projects/Cob/CobHeader.svelte";
  import Markdown from "@app/components/Markdown.svelte";
  import TagInput from "@app/views/projects/Cob/TagInput.svelte";
  import Textarea from "@app/components/Textarea.svelte";
  import ErrorMessage from "@app/components/ErrorMessage.svelte";

  export let projectId: string;
  export let projectHead: string;
  export let baseUrl: BaseUrl;

  let preview: boolean = false;
  let action: "create" | "view";
  $: action =
    $httpdStore.state === "authenticated" &&
    utils.isLocal(baseUrl.hostname) &&
    !preview
      ? "create"
      : "view";

  let issueTitle = "";
  let issueText: string | undefined = undefined;
  let assignees: string[] = [];
  let tags: string[] = [];

  const api = new HttpdClient(baseUrl);

  async function createIssue(sessionId: string) {
    try {
      const result = await api.project.createIssue(
        projectId,
        {
          title: issueTitle,
          description: issueText ?? "",
          assignees: utils.stripDidPrefix(assignees),
          tags: tags,
        },
        sessionId,
      );

      void router.push({
        resource: "projects",
        params: {
          id: projectId,
          baseUrl,
          view: {
            resource: "issue",
            params: { issue: result.id },
          },
        },
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
</script>

<style>
  main {
    padding: 0 2rem 0 8rem;
  }
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
    gap: 4rem;
    border-radius: var(--border-radius);
    font-size: var(--font-size-small);
    padding-left: 1rem;
    margin-left: 1rem;
  }
  .editor {
    flex: 2;
    padding-right: 1rem;
  }
  .author {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  @media (max-width: 960px) {
    main {
      padding-left: 2rem;
    }
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

<main>
  {#if $httpdStore.state === "authenticated"}
    {@const session = $httpdStore.session}
    <div class="form">
      <div class="editor">
        <CobHeader {action} bind:title={issueTitle}>
          <svelte:fragment slot="state">
            {#if action === "view"}
              <Badge variant="positive">open</Badge>
            {/if}
          </svelte:fragment>
          <svelte:fragment slot="description">
            {#if action === "create"}
              <Textarea
                resizable
                bind:value={issueText}
                on:submit={() => {
                  void createIssue(session.id);
                }}
                placeholder="Write a description" />
            {:else if !issueText}
              <p class="txt-missing">No description</p>
            {:else}
              <Markdown
                content={issueText}
                rawPath={utils.getRawBasePath(
                  projectId,
                  baseUrl,
                  projectHead,
                )} />
            {/if}
          </svelte:fragment>
          <div class="author" slot="author">
            {#if action === "view"}
              opened by <Authorship authorId={$httpdStore.session.publicKey} /> now
            {/if}
          </div>
        </CobHeader>
        <div class="actions">
          <Button
            size="small"
            variant="text"
            on:click={() => (preview = !preview)}>
            {#if preview}
              Resume editing
            {:else}
              Preview
            {/if}
          </Button>
          <Button
            disabled={!issueTitle}
            size="small"
            variant="secondary"
            on:click={() => void createIssue(session.id)}>
            Submit
          </Button>
        </div>
      </div>
      <div class="metadata">
        <AssigneeInput
          {action}
          on:save={({ detail: updatedAssignees }) =>
            (assignees = updatedAssignees)} />
        <TagInput
          {action}
          on:save={({ detail: updatedTags }) => (tags = updatedTags)} />
      </div>
    </div>
  {:else}
    <ErrorMessage
      message="Couldn't access issue creation. Make sure you're still logged in." />
  {/if}
</main>
