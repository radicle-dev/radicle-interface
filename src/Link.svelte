<script lang="ts">
  import { navigate, routeToPath, type Route } from "./router";

  export let to: Route;
  export let replace = false;

  function onClick(event: any) {
    event.preventDefault();
    // TODO: Don't push another entry to the history stack when the user
    // clicks on a Link to the page they are currently on.
    navigate(to, { replace });
  }
</script>

<a href={routeToPath(to)} on:click={onClick}>
  <slot />
</a>
