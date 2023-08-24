<script lang="ts">
  import Icon from "@app/components/Icon.svelte";

  export let title: string;
</script>

<style>
  .container {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 1.5rem;
  }
</style>

<div class="layout-centered">
  <div class="container">
    <Icon name="desert" size="48" />
    <div class="title txt-medium txt-bold">{title}</div>
  </div>
</div>
