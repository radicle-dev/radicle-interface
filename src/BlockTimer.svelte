<script lang="ts">
  export let startBlock: number;
  export let duration: number;
  export let latestBlock: number;

  let progress: number = 0;

  $: if (latestBlock < startBlock + duration) {
    progress = (latestBlock - startBlock) * Math.floor(100 / duration);
  } else {
    progress = 100;
  }
</script>

<style>
  .container {
    text-align: center;
    height: 0.5rem;
    width: 100%;
    border-radius: var(--border-radius-small);
    background-color: var(--color-secondary-2);
  }
  .progress-bar {
    height: 0.5rem;
    width: 0px;
    border-radius: var(--border-radius-small);
    background-color: var(--color-secondary);
  }
</style>

<div class="container">
  <div class="progress-bar" style:width={`${progress}%`} />
</div>
