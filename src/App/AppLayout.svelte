<script lang="ts">
  import Footer from "@app/App/Footer.svelte";
  import Header from "@app/App/Header.svelte";
  import MobileFooter from "@app/App/MobileFooter.svelte";
</script>

<style>
  .app {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .header {
    border-bottom: 1px solid var(--color-fill-separator);
  }
  .content {
    height: 100%;
    overflow-y: scroll;
  }
  @media (max-width: 719.98px) {
    .app {
      display: grid;
      grid-template-rows: 1fr auto;
      height: 100%;
    }
    .content {
      overflow-y: scroll;
    }
  }
</style>

<div class="app">
  <div class="global-hide-on-mobile-down header">
    <Header />
  </div>
  <div class="content">
    <slot />
  </div>
  <div style:margin-top="auto">
    <div class="global-hide-on-mobile-down">
      <Footer />
    </div>
    <div class="global-hide-on-small-desktop-up">
      <MobileFooter />
    </div>
  </div>
</div>
