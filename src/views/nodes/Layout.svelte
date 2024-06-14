<script lang="ts">
  import { fade } from "svelte/transition";

  import MobileFooter from "@app/App/MobileFooter.svelte";
  import Link from "@app/components/Link.svelte";

  export let stylePaddingBottom: string = "2.5rem";

  let scrollY: number;

  let smallHeader = false;

  let top: number;

  $: if (scrollY >= 0 && scrollY < 230) {
    top = 288 - scrollY;
  }

  $: if (scrollY > 143) {
    smallHeader = true;
  } else {
    smallHeader = false;
  }
</script>

<style>
  .layout {
    height: 100%;
  }

  .bottom-part {
    display: grid;
    grid-template: auto 1fr auto / auto 1fr auto;
    height: 100%;
  }
  .breadcrumbs {
    display: flex;
    gap: 0.5rem;
    flex-direction: row;
    align-items: center;
  }

  .desktop-header {
    grid-column: 1 / 4;
    border-bottom: 1px solid var(--color-fill-separator);
    background: linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55)),
      url("/images/aliens.png");
    background-position: center;
    background-size: cover;
    height: 18rem;
    display: flex;
    justify-content: space-between;
    flex-direction: column;

    position: sticky;
    top: -14.5rem;
    z-index: 10;
  }
  .inner-header {
    height: 3.5rem;
    position: sticky;
    top: 0;
  }

  .sidebar {
    grid-column: 1 / 2;
    border-right: 1px solid var(--color-fill-separator);
    width: 20.5rem;
    position: fixed;
  }

  .content {
    grid-column: 2 / 3;
    margin-left: 20.5rem;
  }

  .mobile-footer {
    display: none;
  }

  @media (max-width: 719.98px) {
    .desktop-header {
      display: none;
    }
    .content {
      overflow-x: hidden;
      margin-left: 0;
    }
    .mobile-footer {
      margin-top: auto;
      display: grid;
      grid-column: 1 / 4;
      background-color: pink;
    }
  }
</style>

<svelte:window bind:scrollY />

<div class="layout">
  <div class="desktop-header">
    <div class="inner-header">
      <div class="breadcrumbs" style:padding="1rem 1.5rem" style:display="flex">
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
        {#if smallHeader}
          <slot name="small-header" />
        {/if}
      </div>
    </div>
    {#if !smallHeader}
      <div in:fade={{ duration: 200 }}>
        <slot name="header" />
      </div>
    {/if}
  </div>

  <div class="bottom-part">
    <div
      class="sidebar global-hide-on-mobile-down"
      style:top={`${top}px`}
      style:height={`calc(100% - ${top}px)`}>
      <slot name="sidebar" />
    </div>

    <div class="content" style:padding-bottom={stylePaddingBottom}>
      <slot />
    </div>

    <div class="mobile-footer">
      <MobileFooter />
    </div>
  </div>
</div>
