<script lang="ts">
  import Floating from "@app/components/Floating.svelte";
  import Icon from "@app/components/Icon.svelte";
  import Link from "@app/components/Link.svelte";

  import Connect from "@app/App/Header/Connect.svelte";
  import Search from "@app/App/Header/Search.svelte";
  import SettingsDropdown from "@app/App/Header/SettingsDropdown.svelte";
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

  @media (max-width: 720px) {
    header .right {
      gap: 1rem;
    }
  }

  .toggle {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: var(--border-radius-round);
    border: 1px solid var(--color-foreground);
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    color: var(--color-foreground);
    cursor: pointer;
  }
  .toggle:hover {
    background-color: var(--color-foreground);
    color: var(--color-background);
  }
  .logo {
    height: var(--button-regular-height);
    margin-right: 0.5rem;
  }
</style>

<header>
  <div class="left">
    <Link route={{ resource: "home" }}>
      <img class="logo" alt="Radicle logo" src="/radicle.svg" />
    </Link>
    <Search />
  </div>

  <div class="right">
    <div class="layout-desktop">
      <Connect />
    </div>
    <Floating>
      <div slot="toggle">
        <button class="toggle" name="Settings">
          <Icon name="gear" />
        </button>
      </div>
      <SettingsDropdown slot="modal" />
    </Floating>
  </div>
</header>
