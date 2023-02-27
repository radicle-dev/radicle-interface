<script lang="ts" strictEvents>
  import type { BaseUrl } from "@httpd-client";
  import type { StoredSession } from "@app/lib/session";

  import { createEventDispatcher } from "svelte";

  import * as modal from "@app/lib/modal";
  import * as utils from "@app/lib/utils";
  import { HttpdClient } from "@httpd-client";
  import { sessionStore } from "@app/lib/session";
  import { stripDidPrefix, validateTag } from "@app/lib/cobs";

  import AuthenticationErrorModal from "@app/views/session/AuthenticationErrorModal.svelte";
  import Authorship from "@app/components/Authorship.svelte";
  import Avatar from "@app/components/Avatar.svelte";
  import Badge from "@app/components/Badge.svelte";
  import Button from "@app/components/Button.svelte";
  import CobHeader from "@app/views/projects/Cob/CobHeader.svelte";
  import CobSideInput from "@app/views/projects/Cob/CobSideInput.svelte";
  import Comment from "@app/components/Comment.svelte";

  export let session: StoredSession;
  export let projectId: string;
  export let projectHead: string;
  export let baseUrl: BaseUrl;

  const dispatch = createEventDispatcher<{ create: string }>();
  const action: "edit" | "view" =
    $sessionStore && utils.isLocal(baseUrl.hostname) ? "edit" : "view";

  let preview: boolean = false;

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
          assignees: stripDidPrefix(assignees),
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
      <CobHeader action={preview ? "view" : "create"} bind:title={issueTitle}>
        <svelte:fragment slot="state">
          <Badge variant="positive">open</Badge>
          <Authorship
            timestamp={Date.now()}
            authorId={session.publicKey}
            caption="opened this issue" />
        </svelte:fragment>
      </CobHeader>
      <div class="comments">
        <Comment
          bind:body={issueText}
          on:submit={createIssue}
          authorId={session.publicKey}
          timestamp={Date.now()}
          action={preview ? "view" : "create"}
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
      <CobSideInput
        {action}
        title="Assignees"
        placeholder="Add assignee"
        on:save={({ detail: assignees }) => (assignees = assignees)}
        validate={item => Boolean(utils.parseNodeId(item))}
        validateAdd={(item, items) => validateTag(item, items)}>
        <svelte:fragment let:item>
          <Avatar inline nodeId={item} />
          <span>{utils.formatNodeId(item)}</span>
        </svelte:fragment>
      </CobSideInput>
      <CobSideInput
        title="Tags"
        placeholder="Add tag"
        on:save={({ detail: tags }) => (tags = tags)}
        validate={item => item.trim().length > 0}
        validateAdd={(item, items) => validateTag(item, items)}>
        <svelte:fragment let:item>
          <div class="tag">{item}</div>
        </svelte:fragment>
      </CobSideInput>
    </div>
  </div>
</main>
