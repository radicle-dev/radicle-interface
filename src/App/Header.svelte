<script lang="ts">
  import Breadcrumbs from "./Header/Breadcrumbs.svelte";
  import Link from "@app/components/Link.svelte";
</script>

<style>
  header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
    padding: 0.5rem 1rem;
    height: 3.5rem;
  }

  .logo {
    height: var(--button-regular-height);
    margin: 0 0.5rem;
  }
</style>

<header>
  <Link
    style="display: flex; align-items: center;"
    route={{ resource: "home" }}>
    <img
      width="24"
      height="24"
      class="logo"
      alt="Radicle logo"
      src="/radicle.svg" />
  </Link>
  <Breadcrumbs />
</header>
