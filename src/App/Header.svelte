<script lang="ts">
  import Floating from "@app/components/Floating.svelte";
  import Icon from "@app/components/Icon.svelte";
  import Link from "@app/components/Link.svelte";
  import SettingsDropdown from "./Header/SettingsDropdown.svelte";

  import Logo from "./Header/Logo.svelte";
  import Search from "./Header/Search.svelte";
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
    display: flex;
    height: var(--button-regular-height);
    align-items: center;
    margin-right: 0.5rem;
  }
  .search {
    width: 16rem;
  }

  @media (max-width: 720px) {
    header .right {
      gap: 1rem;
    }
    .search {
      display: none;
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
  }
  .toggle:hover {
    background-color: var(--color-foreground);
    color: var(--color-background);
  }
</style>

<header>
  <div class="left">
    <Link route={{ resource: "home" }}><span class="logo"><Logo /></span></Link>
    <div class="search">
      <Search />
    </div>
  </div>

  <div class="right">
    <Floating>
      <div slot="toggle">
        <button class="toggle" name="Settings">
          <Icon name="gear" />
        </button>
      </div>
      <SettingsDropdown slot="modal" />
    </Floating>
    <div class="layout-mobile">
      <Floating>
        <div slot="toggle">
          <span style="transform: scale(1.2);">
            <Icon name="ellipsis" />
          </span>
        </div>
      </Floating>
    </div>
  </div>
</header>
