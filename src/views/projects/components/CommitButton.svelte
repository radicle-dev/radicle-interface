<script lang="ts">
  import type { BaseUrl, Commit } from "@httpd-client";

  import Button from "@app/components/Button.svelte";
  import Link from "@app/components/Link.svelte";
  import { formatCommit } from "@app/lib/utils";

  export let styleRoundBorders: boolean = false;
  export let projectId: string;
  export let baseUrl: BaseUrl;
  export let commit: Commit["commit"];

  $: commitShortId = formatCommit(commit.id);
</script>

<style>
  .commit {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .identifier {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>

<Button
  title="Current HEAD"
  variant="not-selected"
  styleBorderRadius={styleRoundBorders
    ? "var(--border-radius-tiny)"
    : "0 var(--border-radius-tiny) var(--border-radius-tiny) 0"}>
  <Link
    route={{
      resource: "project.commit",
      project: projectId,
      node: baseUrl,
      commit: commit.id,
    }}>
    <div class="commit">
      <div class="identifier global-commit">
        {commitShortId}
      </div>
      <span>{commit.summary}</span>
    </div>
  </Link>
</Button>
