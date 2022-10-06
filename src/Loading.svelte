<script lang="ts">
  import { onDestroy } from "svelte";

  export let center = false;
  export let condensed = false;
  export let fadeIn = false;
  export let margins = false;
  export let small = false;

  let show: boolean = false;

  const timeout = window.setTimeout(() => {
    show = true;
  }, 200);

  onDestroy(() => {
    window.clearTimeout(timeout);
  });
</script>

<style>
  .container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .spinner {
    margin: auto 0;
    width: 70px;
    text-align: center;
    cursor: wait;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
  }
  .spinner.center {
    margin: auto auto;
  }
  .spinner.margins {
    margin: 0 0.5rem;
  }

  .spinner > div {
    width: 18px;
    height: 18px;
    background-color: var(--color-secondary);
    border-radius: var(--border-radius-round);
    display: inline-block;
    -webkit-animation: sk-bouncedelay 1.4s infinite ease-in-out both;
    animation: sk-bouncedelay 1.4s infinite ease-in-out both;
  }

  .spinner.condensed > div {
    -webkit-animation: sk-bouncedelay-condensed 0.7s infinite linear both;
    animation: sk-bouncedelay-condensed 0.7s infinite linear both;
  }

  .spinner.small > div {
    width: 0.5rem;
    height: 0.5rem;
  }

  .spinner.small {
    width: 35px;
  }

  .spinner .bounce1 {
    -webkit-animation-delay: -0.32s;
    animation-delay: -0.32s;
  }

  .spinner .bounce2 {
    -webkit-animation-delay: -0.16s;
    animation-delay: -0.16s;
  }

  @-webkit-keyframes sk-bouncedelay-condensed {
    0%,
    100% {
      -webkit-transform: scale(0.2);
    }
    50% {
      -webkit-transform: scale(1);
    }
  }

  @keyframes sk-bouncedelay-condensed {
    0%,
    100% {
      -webkit-transform: scale(0.2);
      transform: scale(0.2);
    }
    50% {
      -webkit-transform: scale(1);
      transform: scale(1);
    }
  }

  @-webkit-keyframes sk-bouncedelay {
    0%,
    80%,
    100% {
      -webkit-transform: scale(0);
    }
    40% {
      -webkit-transform: scale(1);
    }
  }

  @keyframes sk-bouncedelay {
    0%,
    80%,
    100% {
      -webkit-transform: scale(0);
      transform: scale(0);
    }
    40% {
      -webkit-transform: scale(1);
      transform: scale(1);
    }
  }

  .fade-in {
    animation: fadeIn 1.5s;
    animation-timing-function: ease-in;
    -webkit-animation: fadeIn 1.5s;
    -webkit-animation-timing-function: ease-in;
  }

  @keyframes fadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
  @-webkit-keyframes fadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
</style>

{#if show}
  <div class="container">
    <div
      class="spinner"
      class:fade-in={fadeIn}
      class:small
      class:center
      class:margins
      class:condensed>
      <div class="bounce1" style="background-color: var(--color-secondary)" />
      {#if !condensed}
        <div class="bounce2" style="background-color: var(--color-secondary)" />
        <div class="bounce3" style="background-color: var(--color-secondary)" />
      {/if}
    </div>
  </div>
{/if}
