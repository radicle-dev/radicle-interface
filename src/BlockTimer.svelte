<script lang="ts">
  import type { Config } from "@app/config";

  export let config: Config;
  export let startBlock: number;
  export let duration: number;

  let currentBlock: number = startBlock;

  config.provider.on("block", (latestBlock: number) => {
    if (startBlock + duration > currentBlock) currentBlock = latestBlock;
  });
</script>

<style>
  .parent {
    text-align: center;
    height: 0.5rem;
    width: 100%;
    border-radius: 0.25rem;
    background-color: var(--color-secondary-background);
  }
  .loader {
    height: 0.5rem;
    width: 0px;
    border-radius: 0.25rem;
    background-color: var(--color-secondary);
  }
</style>

<div class="parent">
  <div class="loader" style="width: {(currentBlock - startBlock) * 10}%" />
</div>
