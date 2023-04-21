<script lang="ts" strictEvents>
  import type { ProjectsParams } from "@app/lib/router/definitions";
  import { createEventDispatcher } from "svelte";

  import {
    projectLinkHref,
    updateProjectRoute,
    useDefaultNavigation,
  } from "@app/lib/router";

  export let projectParams: Partial<ProjectsParams>;
  export let title: string | undefined = undefined;

  const dispatch = createEventDispatcher<{ click: never }>();

  function navigateToRoute(event: MouseEvent): void {
    if (useDefaultNavigation(event)) {
      return;
    }

    event.preventDefault();
    updateProjectRoute(projectParams);
    dispatch("click");
  }
</script>

<a {title} on:click={navigateToRoute} href={projectLinkHref(projectParams)}>
  <slot />
</a>
