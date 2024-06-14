<script lang="ts">
  import Layout from "@app/App/Layout.svelte";
  import Icon from "@app/components/Icon.svelte";

  export let title: string;
</script>

<style>
  .container {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 1.5rem;
    height: 100%;
  }
</style>

<Layout>
  <div class="container">
    <Icon name="desert" size="48" />
    <div class="title txt-medium txt-bold">{title}</div>
  </div>
</Layout>
