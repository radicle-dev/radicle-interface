<script lang="ts" strictEvents>
  import type { ProjectsParams } from "@app/views/projects/router";
  import { createEventDispatcher } from "svelte";

  import { useDefaultNavigation } from "@app/lib/router";
  import {
    projectLinkHref,
    updateProjectRoute,
  } from "@app/views/projects/router";

  export let projectParams: Partial<
    Omit<ProjectsParams, "id" | "route" | "hash">
  >;
  export let title: string | undefined = undefined;

  const dispatch = createEventDispatcher<{ click: null }>();

  function navigateToRoute(event: MouseEvent): void {
    if (useDefaultNavigation(event)) {
      return;
    }

    event.preventDefault();
    void updateProjectRoute(projectParams);
    dispatch("click");
  }
</script>

<a {title} on:click={navigateToRoute} href={projectLinkHref(projectParams)}>
  <slot />
</a>
