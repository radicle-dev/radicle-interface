<script lang="typescript">
  import { Link } from "svelte-routing";

  export let to: string;
  export let primary = false;

  function getProps(_props: any) {
    if (primary) {
      return { "class": "primary" };
    }
    return {};
  }
</script>

<Link to="{to}" getProps="{getProps}">
  <slot />
</Link>
