<script lang="ts">
  import Floating from "@app/components/Floating.svelte";
  import Icon from "@app/components/Icon.svelte";
  import Link from "@app/components/Link.svelte";

  import Button from "@app/components/Button.svelte";
  import Connect from "@app/App/Header/Connect.svelte";
  import Search from "@app/App/Header/Search.svelte";
  import ThemeSettings from "@app/App/Header/ThemeSettings.svelte";
</script>

<style>
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0;
    padding: 1.5rem;
    height: 5.5rem;
  }
  .left,
  .right {
    display: flex;
    align-items: center;
    height: var(--button-regular-height);
    gap: 1rem;
  }

  .logo {
    height: var(--button-regular-height);
    margin-right: 0.5rem;
  }

  @media (max-width: 720px) {
    header .right {
      gap: 1rem;
    }
  }
</style>

<header>
  <div class="left">
    <Link route={{ resource: "home" }}>
      <img
        width="40"
        height="40"
        class="logo"
        alt="Radicle logo"
        src="/radicle.svg" />
    </Link>
    <Search />
  </div>

  <div class="right">
    <div class="layout-desktop">
      <Connect />
    </div>
    <Floating>
      <div slot="toggle">
        <Button variant="outline" size="large" ariaLabel="Settings">
          <Icon name="brush" />
        </Button>
      </div>
      <ThemeSettings slot="modal" />
    </Floating>
  </div>
</header>
