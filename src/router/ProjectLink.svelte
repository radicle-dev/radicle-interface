<script lang="ts">
  import type { ProjectsParams } from "./definitions";
  import { updateProjectRoute, projectLinkHref } from "./index";

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
