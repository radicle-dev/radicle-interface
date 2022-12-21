<script lang="ts" strictEvents>
  import type { Route } from "@app/lib/router/definitions";

  import { createEventDispatcher } from "svelte";
  import { push, routeToPath } from "@app/lib/router";

  export let route: Route;
  export let title: string | null = null;
  export let id: string | null = null;

  const dispatch = createEventDispatcher<{
    click: never;
  }>();

  function onClick(): void {
    push(route);
    dispatch("click");
  }
</script>

<a on:click|preventDefault={onClick} {title} {id} href={routeToPath(route)}>
  <slot />
</a>
