<script lang="ts" strictEvents>
  import type { Project } from "@app/lib/project";
  import type { Session } from "@app/lib/session";

  import * as modal from "@app/lib/modal";
  import AuthenticationErrorModal from "@app/views/session/AuthenticationErrorModal.svelte";
  import Authorship from "@app/components/Authorship.svelte";
  import Avatar from "@app/components/Avatar.svelte";
  import Badge from "@app/components/Badge.svelte";
  import Button from "@app/components/Button.svelte";
  import CobHeader from "@app/views/projects/Cob/CobHeader.svelte";
  import CobSideInput from "@app/views/projects/Cob/CobSideInput.svelte";
  import Comment from "@app/components/Comment.svelte";
  import { Issue } from "@app/lib/issue";
  import { createEventDispatcher } from "svelte";
  import { formatNodeId, isLocal, parseNodeId } from "@app/lib/utils";
  import { sessionStore } from "@app/lib/session";
  import { stripDidPrefix, validateTag } from "@app/lib/cobs";

  export let session: Session;
  export let project: Project;

  const dispatch = createEventDispatcher<{ create: string }>();
  const action: "edit" | "view" =
    $sessionStore && isLocal(project.seed.addr.host) ? "edit" : "view";

  let preview: boolean = false;

  let issueTitle = "";
  let issueText = "";
  let assignees: string[] = [];
  let tags: string[] = [];

  async function createIssue() {
    try {
      const result = await Issue.createIssue(
        project.id,
        issueTitle,
        issueText,
        stripDidPrefix(assignees),
        tags,
        project.seed.addr,
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
            author={{ id: session.publicKey }}
            caption="opened this issue" />
        </svelte:fragment>
      </CobHeader>
      <div class="comments">
        <Comment
          bind:body={issueText}
          on:submit={createIssue}
          author={{ id: session.publicKey }}
          timestamp={Date.now()}
          action={preview ? "view" : "create"}
          rawPath={project.getRawPath()} />
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
        validate={item => Boolean(parseNodeId(item))}
        validateAdd={(item, items) => validateTag(item, items)}>
        <svelte:fragment let:item>
          <Avatar inline nodeId={item} />
          <span>{formatNodeId(item)}</span>
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
