<script lang="ts">
  import type { State } from "../Issue.svelte";
  import type { BaseUrl, Issue, Project, Reaction } from "@httpd-client";

  import uniqBy from "lodash/uniqBy";

  import * as modal from "@app/lib/modal";
  import * as role from "@app/lib/roles";
  import * as utils from "@app/lib/utils";
  import { HttpdClient } from "@httpd-client";
  import { httpdStore } from "@app/lib/httpd";

  import AssigneeInput from "../Cob/AssigneeInput.svelte";
  import Embeds from "../Cob/Embeds.svelte";
  import ErrorModal from "@app/modals/ErrorModal.svelte";
  import LabelInput from "../Cob/LabelInput.svelte";

  export let baseUrl: BaseUrl;
  export let issue: Issue;
  export let project: Project;
  export let refreshIssue: () => Promise<void>;

  const api = new HttpdClient(baseUrl);

  $: uniqueEmbeds = uniqBy(
    issue.discussion.flatMap(comment => comment.embeds),
    "content",
  );

  async function saveLabels(sessionId: string, labels: string[]) {
    try {
      await api.project.updateIssue(
        project.id,
        issue.id,
        { type: "label", labels },
        sessionId,
      );
    } catch (error) {
      if (error instanceof Error) {
        modal.show({
          component: ErrorModal,
          props: {
            title: "Issue labels editing failed",
            subtitle: [
              "There was an error while updating the issue.",
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
      await refreshIssue();
    }
  }

  async function saveAssignees(
    sessionId: string,
    assignees: Reaction["authors"],
  ) {
    try {
      await api.project.updateIssue(
        project.id,
        issue.id,
        { type: "assign", assignees: assignees.map(({ id }) => id) },
        sessionId,
      );
    } catch (error) {
      if (error instanceof Error) {
        modal.show({
          component: ErrorModal,
          props: {
            title: "Issue assignees editing failed",
            subtitle: [
              "There was an error while updating the issue.",
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
      await refreshIssue();
    }
  }

  $: session =
    $httpdStore.state === "authenticated" && utils.isLocal(baseUrl.hostname)
      ? $httpdStore.session
      : undefined;
  let assigneeState: State = "read";
  let labelState: State = "read";
</script>

<AssigneeInput
  locallyAuthenticated={Boolean(
    role.isDelegate(session?.publicKey, project.delegates),
  )}
  assignees={issue.assignees}
  submitInProgress={assigneeState === "submit"}
  on:save={async ({ detail: newAssignees }) => {
    if (session) {
      assigneeState = "submit";
      try {
        await saveAssignees(session.id, newAssignees);
      } finally {
        assigneeState = "read";
      }
    }
    await refreshIssue();
  }} />
<LabelInput
  locallyAuthenticated={Boolean(
    role.isDelegate(session?.publicKey, project.delegates),
  )}
  labels={issue.labels}
  submitInProgress={labelState === "submit"}
  on:save={async ({ detail: newLabels }) => {
    if (session) {
      labelState = "submit";
      try {
        await saveLabels(session.id, newLabels);
      } finally {
        labelState = "read";
      }
    }
    await refreshIssue();
  }} />
<Embeds embeds={uniqueEmbeds} />
