<script lang="ts">
  export let size: number | undefined;
  export let name: "source" | "issue" | "patch" | "node";
</script>

<style>
  svg {
    display: flex;
    flex-shrink: 0;
  }
</style>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->

<svg
  xmlns="http://www.w3.org/2000/svg"
  width={size ? size : "16"}
  height="16"
  fill="currentColor"
  viewBox="0 0 16 16">
  {#if name === "source"}
    <path
      fill="currentColor"
      fill-rule="evenodd"
      d="M6.104 3.646a.5.5 0 010 .708l-3.28 3.278a.167.167 0 00.001.236l3.279 3.278a.5.5 0 01-.708.708L2.118 8.575a1.167 1.167 0 010-1.65l3.278-3.279a.5.5 0 01.708 0zm3.792 0a.5.5 0 01.707 0l3.28 3.279a1.167 1.167 0 010 1.65l-3.28 3.279a.5.5 0 01-.707-.708l3.279-3.278a.167.167 0 000-.236L9.896 4.354a.5.5 0 010-.708z"
      clip-rule="evenodd">
    </path>
  {:else if name === "issue"}
    <path
      fill="currentColor"
      fill-rule="evenodd"
      d="M1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0zM8 2.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11z"
      clip-rule="evenodd">
    </path>
    <path
      fill="currentColor"
      fill-rule="evenodd"
      d="M7 8a1 1 0 102 0 1 1 0 00-2 0zm1 2a2 2 0 110-4 2 2 0 010 4z"
      clip-rule="evenodd">
    </path>
  {:else if name === "patch"}
    <path
      fill="currentColor"
      fill-rule="evenodd"
      d="M3.5 2.833a1 1 0 100 2 1 1 0 000-2zm-2 1a2 2 0 114 0 2 2 0 01-4 0zM11.75 11.833a1 1 0 100 2 1 1 0 000-2zm-2 1a2 2 0 114 0 2 2 0 01-4 0zM3.5 11.833a1 1 0 100 2 1 1 0 000-2zm-2 1a2 2 0 114 0 2 2 0 01-4 0z"
      clip-rule="evenodd">
    </path>
    <path
      fill="currentColor"
      fill-rule="evenodd"
      d="M3.5 4.833a.5.5 0 01.5.5v6a.5.5 0 01-1 0v-6a.5.5 0 01.5-.5zM9.104 3.48a.5.5 0 010 .707L7.207 6.083 9.104 7.98a.5.5 0 01-.708.707l-2.25-2.25a.5.5 0 010-.707l2.25-2.25a.5.5 0 01.708 0z"
      clip-rule="evenodd">
    </path>
    <path
      fill="currentColor"
      fill-rule="evenodd"
      d="M6 6.083a.5.5 0 00.5.5H11a.25.25 0 01.25.25v4.5a.5.5 0 101 0v-4.5c0-.69-.56-1.25-1.25-1.25H6.5a.5.5 0 00-.5.5z"
      clip-rule="evenodd">
    </path>
  {:else if name === "node"}
    <path
      fill="currentColor"
      fill-rule="evenodd"
      d="M4 9.167a.833.833 0 100 1.666.833.833 0 000-1.666zM2.167 10a1.833 1.833 0 113.666 0 1.833 1.833 0 01-3.666 0zM4.667 3.167a.833.833 0 100 1.666.833.833 0 000-1.666zM2.833 4A1.833 1.833 0 116.5 4a1.833 1.833 0 01-3.667 0zM12 3.833A.833.833 0 1012 5.5a.833.833 0 000-1.667zm-1.833.834a1.833 1.833 0 113.666 0 1.833 1.833 0 01-3.666 0zM11.333 12.5a.833.833 0 100 1.667.833.833 0 000-1.667zm-1.833.833a1.833 1.833 0 113.667 0 1.833 1.833 0 01-3.667 0z"
      clip-rule="evenodd">
    </path>
    <path
      fill="currentColor"
      fill-rule="evenodd"
      d="M5.027 5.284a1.334 1.334 0 01-.994-.11L3.64 8.716a1.334 1.334 0 01.993.11l.394-3.542zm-.276 3.614c.28.192.484.488.555.832l5.943-3.962a1.334 1.334 0 01-.555-.832L4.751 8.898zm7.653-2.96a1.333 1.333 0 01-.997-.077l-.477 6.201a1.333 1.333 0 01.997.077l.477-6.201zM10 13.277c.015-.358.171-.68.414-.91l-5.083-2.31a1.33 1.33 0 01-.414.91l5.083 2.31z"
      clip-rule="evenodd">
    </path>
  {/if}
</svg>
