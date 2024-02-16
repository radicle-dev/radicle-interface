<script lang="ts">
  import type { ErrorParam } from "@app/lib/router/definitions";

  import AppLayout from "@app/App/AppLayout.svelte";
  import ErrorMessage from "@app/components/ErrorMessage.svelte";

  export let title: string;
  export let description: string;
  export let error: ErrorParam = undefined;
</script>

<style>
  .wrapper {
    padding: 4rem 0 2rem 0;
    gap: 1.5rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.5rem;
  }
</style>

<AppLayout>
  <div class="wrapper">
    <div class="container">
      <ErrorMessage icon="desert" {title} {description} {error} />
    </div>
  </div>
</AppLayout>
