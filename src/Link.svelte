<script lang="typescript">
  import { Link } from "svelte-routing";

  export let to: string;
  export let primary = false;

  function getProps(/* props: any */) {
    if (primary) {
      return { "class": "primary link" };
    }
    return { "class": "link" };
  }
</script>

<Link to="{to}" getProps="{getProps}">
  <slot />
</Link>
