<script lang="ts" strictEvents>
  import type { BaseUrl } from "@httpd-client";
  import type { StoredSession } from "@app/lib/session";

  import { createEventDispatcher } from "svelte";

  import * as modal from "@app/lib/modal";
  import * as utils from "@app/lib/utils";
  import { HttpdClient } from "@httpd-client";
  import { sessionStore } from "@app/lib/session";

  import AssigneeInput from "@app/views/projects/Cob/AssigneeInput.svelte";
  import AuthenticationErrorModal from "@app/views/session/AuthenticationErrorModal.svelte";
  import Author from "@app/components/Author.svelte";
  import Badge from "@app/components/Badge.svelte";
  import Button from "@app/components/Button.svelte";
  import CobHeader from "@app/views/projects/Cob/CobHeader.svelte";
  import Comment from "@app/components/Comment.svelte";
  import TagInput from "@app/views/projects/Cob/TagInput.svelte";

  export let session: StoredSession;
  export let projectId: string;
  export let projectHead: string;
  export let baseUrl: BaseUrl;

  const dispatch = createEventDispatcher<{ create: string }>();
  let preview: boolean = false;
  let action: "create" | "view";
  $: action =
    $sessionStore && utils.isLocal(baseUrl.hostname) && !preview
      ? "create"
      : "view";

  let issueTitle = "";
  let issueText = "";
  let assignees: string[] = [];
  let tags: string[] = [];

  const api = new HttpdClient(baseUrl);

  async function createIssue() {
    try {
      const result = await api.project.createIssue(
        projectId,
        {
          title: issueTitle,
          description: issueText,
          assignees: utils.stripDidPrefix(assignees),
          tags: tags,
        },
        session.id,
      );
      dispatch("create", result.id);
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
    border-radius: var(--border-radius);
    font-size: var(--font-size-small);
    padding-left: 1rem;
    margin-left: 1rem;
  }
  .editor {
    flex: 2;
    padding-right: 1rem;
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
  }
</style>

<main>
  <div class="form">
    <div class="editor">
      <CobHeader {action} bind:title={issueTitle}>
        <svelte:fragment slot="state">
          <Badge variant="positive">open</Badge>
          <Author nodeId={session.publicKey} />
          <span>opened this issue {utils.formatTimestamp(Date.now())}</span>
        </svelte:fragment>
      </CobHeader>
      <div class="comments">
        <Comment
          bind:body={issueText}
          on:submit={createIssue}
          nodeId={session.publicKey}
          timestamp={Date.now()}
          {action}
          rawPath={utils.getRawBasePath(projectId, baseUrl, projectHead)} />
      </div>
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
          on:click={createIssue}>
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
</main>
