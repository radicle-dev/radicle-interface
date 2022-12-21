<script lang="ts">
  import type { ProjectsParams } from "@app/lib/router/definitions";
  import { updateProjectRoute, projectLinkHref } from "@app/lib/router";

  export let projectParams: Partial<ProjectsParams>;
  export let id: string | undefined = undefined;
</script>

<a
  {id}
  on:click|preventDefault={() => {
    updateProjectRoute(projectParams);
  }}
  href={projectLinkHref(projectParams)}>
  <slot />
</a>
