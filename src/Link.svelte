<script lang="ts">
  import { Link } from "svelte-routing";

  export let primary = false;
  export let to: string;

  function getProps(/* props: any */) {
    if (primary) {
      return { class: "primary link" };
    }
    return { class: "link" };
  }
</script>

<Link {to} {getProps}>
  <slot />
</Link>
