<script lang="ts">
  import type { BaseUrl } from "@http-client";

  import { formatCommit } from "@app/lib/utils";
  import Link from "@app/components/Link.svelte";

  export let baseUrl: BaseUrl;
  export let projectId: string;
  export let commitId: string;
</script>

<Link
  route={{
    resource: "project.commit",
    node: baseUrl,
    project: projectId,
    commit: commitId,
  }}>
  <span class="global-commit">
    {formatCommit(commitId)}
  </span>
</Link>
