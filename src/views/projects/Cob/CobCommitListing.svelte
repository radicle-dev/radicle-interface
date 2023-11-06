<script lang="ts">
  import type { BaseUrl, CommitHeader } from "@httpd-client";

  import { onMount } from "svelte";

  import CobCommitTeaser from "@app/views/projects/Cob/CobCommitTeaser.svelte";

  export let baseUrl: BaseUrl;
  export let commits: CommitHeader[];
  export let projectId: string;

  let commitsDiv: HTMLElement | undefined = undefined;
  const commitsDot: HTMLElement[] = [];

  onMount(() => {
    if (commitsDiv && commitsDot) {
      const lastCommitDot = commitsDot.pop();
      if (lastCommitDot?.parentElement) {
        // Calculate the position of the last commit-dot relative to the div.commits
        const commitDotBottom = lastCommitDot.parentElement.offsetTop + 10.5;

        // Set the height of the pseudo-element (border)
        commitsDiv.style.setProperty("--border-height", `${commitDotBottom}px`);
      }
    }
  });
</script>

<style>
  .commits {
    position: relative;
    display: flex;
    flex-direction: column;
    font-size: var(--font-size-small);
    margin-left: 1rem;
    gap: 0.5rem;
    padding: 1rem 1rem;
  }

  .commits::after {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    border-left: 1px solid var(--color-fill-separator);
    height: var(--border-height);
  }
  .commit-dot {
    border-radius: var(--border-radius-round);
    width: 4px;
    height: 4px;
    position: absolute;
    top: 0.5rem;
    left: -17.5px;
    background-color: var(--color-fill-separator);
  }
</style>

<div bind:this={commitsDiv} class="commits">
  {#each commits.reverse() as commit, index}
    <div style:position="relative">
      <div class="commit-dot" bind:this={commitsDot[index]} />
      <CobCommitTeaser {commit} {baseUrl} {projectId} />
    </div>
  {/each}
</div>
