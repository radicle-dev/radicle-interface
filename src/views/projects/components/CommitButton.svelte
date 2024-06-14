<script lang="ts">
  import type { BaseUrl, Commit } from "@http-client";

  import Button from "@app/components/Button.svelte";
  import Link from "@app/components/Link.svelte";
  import { formatCommit } from "@app/lib/utils";

  export let styleMinWidth: string | undefined = undefined;
  export let styleWidth: "100%" | undefined = undefined;
  export let styleRoundBorders: boolean = false;
  export let projectId: string;
  export let baseUrl: BaseUrl;
  export let hideSummaryOnMobile: boolean = true;
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

<Link
  styleTextOverflow
  route={{
    resource: "project.commit",
    project: projectId,
    node: baseUrl,
    commit: commit.id,
  }}>
  <Button
    title="Current HEAD"
    variant="not-selected"
    {styleWidth}
    {styleMinWidth}
    styleBorderRadius={styleRoundBorders
      ? "var(--border-radius-tiny)"
      : "0 var(--border-radius-tiny) var(--border-radius-tiny) 0"}>
    <div class="txt-overflow commit">
      <div class="identifier global-commit">
        {commitShortId}
      </div>
      <span
        class="txt-overflow"
        class:global-hide-on-small-desktop-down={hideSummaryOnMobile}>
        {commit.summary}
      </span>
    </div>
  </Button>
</Link>
