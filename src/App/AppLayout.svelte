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
</style>

<div class="app">
  <Header />
  <slot />
  <div style:margin-top="auto">
    <div class="global-hide-on-mobile">
      <Footer />
    </div>
    <div class="global-hide-on-desktop">
      <MobileFooter />
    </div>
  </div>
</div>
