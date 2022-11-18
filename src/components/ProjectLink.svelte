<script lang="ts">
  import type { ProjectsParams } from "@app/lib/router/definitions";
  import { updateProjectRoute, projectLinkHref } from "@app/lib/router";

  export let projectParams: Partial<ProjectsParams>;
  export let id: string | undefined = undefined;
</script>

<a
  {id}
  on:click|stopPropagation|preventDefault={e => {
    updateProjectRoute(projectParams, { mouseEvent: e });
  }}
  href={projectLinkHref(projectParams)}>
  <slot />
</a>
