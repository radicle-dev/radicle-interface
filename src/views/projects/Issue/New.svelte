<script lang="ts" strictEvents>
  import type { Project } from "@app/lib/project";
  import type { Session } from "@app/lib/session";

  import * as modal from "@app/lib/modal";
  import AuthenticationErrorModal from "@app/views/session/AuthenticationErrorModal.svelte";
  import Button from "@app/components/Button.svelte";
  import Comment from "@app/components/Comment.svelte";
  import IssueSidebar from "@app/views/projects/Issue/IssueSidebar.svelte";
  import IssueHeader from "@app/views/projects/Issue/IssueHeader.svelte";
  import { Issue } from "@app/lib/issue";
  import { createEventDispatcher } from "svelte";
  import { stripDidPrefix } from "@app/lib/cobs";

  export let session: Session;
  export let project: Project;

  const dispatch = createEventDispatcher<{ create: string }>();

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
      <IssueHeader
        author={{ id: session.publicKey }}
        state={{ status: "open" }}
        timestamp={Date.now()}
        action={preview ? "view" : "create"}
        bind:title={issueTitle} />
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
    <IssueSidebar
      on:saveAssignees={({ detail }) => (assignees = detail)}
      on:saveTags={({ detail }) => (tags = detail)}
      action="create" />
  </div>
</main>
