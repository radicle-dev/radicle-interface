<script lang="ts">
  import type { Tweened } from "svelte/motion";

  import { onMount } from "svelte";
  import { cubicInOut } from "svelte/easing";
  import { tweened } from "svelte/motion";

  // Force a height of 0, and optionally apply `negativeMarginWhileCollapsed`.
  export let collapsed = false;

  // If true, all content height changes are transitioned. If false, only
  // collapsing and expanding the content is transitioned.
  export let transitionHeightChanges = false;

  // Force a negative margin while collapsed. This is useful when you use
  // `transitionedHeight` in the context of some layout where there's further
  // content below.
  export let negativeMarginWhileCollapsed: string | undefined = undefined;

  let contentContainerElem: HTMLDivElement;
  let fitContent = !collapsed;

  let containerHeight: Tweened<number> | undefined;
  onMount(() => {
    if (collapsed) {
      containerHeight = tweened(0);
    } else {
      containerHeight = tweened(
        contentContainerElem.getBoundingClientRect().height,
      );
    }
  });

  let animating = false;
  let zeroHeight = collapsed;
  let previouslyCollapsed = collapsed;

  async function updateHeight() {
    if (!containerHeight) return;

    const newHeight = collapsed
      ? 0
      : contentContainerElem.getBoundingClientRect().height;

    const collapsedChanged = previouslyCollapsed !== collapsed;

    const shouldTransition = transitionHeightChanges || collapsedChanged;

    if (collapsed && !collapsedChanged) return;

    // Setting fitContent to false so that we can smoothly animate the
    // container height.
    if (shouldTransition) {
      fitContent = false;
      animating = true;
    }

    void containerHeight.set(
      newHeight,
      shouldTransition ? { duration: 300, easing: cubicInOut } : undefined,
    );

    if (shouldTransition && !collapsed) {
      setTimeout(() => {
        fitContent = true;
        animating = false;
      }, 300);
    }

    zeroHeight = newHeight === 0;

    previouslyCollapsed = collapsed;
  }
  $: {
    collapsed;
    void updateHeight();
  }

  let sizeObserver: ResizeObserver | undefined;
  onMount(() => {
    sizeObserver = new ResizeObserver(updateHeight);
    sizeObserver.observe(contentContainerElem);

    return () => sizeObserver?.disconnect();
  });

  $: heightStyleString = fitContent ? "fit-content" : `${$containerHeight}px`;
</script>

<style>
  .transitioned-height {
    width: 100%;
    transition: margin-bottom 0.3s;
    position: relative;
  }

  .animating,
  .zero-height {
    overflow: hidden;
  }
</style>

<div
  class="transitioned-height"
  class:animating
  class:zero-height={zeroHeight}
  style:margin-bottom={negativeMarginWhileCollapsed && zeroHeight === true
    ? negativeMarginWhileCollapsed
    : undefined}
  style:height={heightStyleString}>
  <div class="inner" bind:this={contentContainerElem}>
    <slot />
  </div>
</div>
