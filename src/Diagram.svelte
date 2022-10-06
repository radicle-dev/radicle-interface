<script lang="ts">
  import type { WeeklyActivity } from "./commit";

  import { onMount } from "svelte";

  export let points: WeeklyActivity[];
  export let strokeWidth: number;
  export let viewBoxHeight: number;
  export let viewBoxWidth: number;

  // The path strings to be inserted into the svg <path>
  let path = "";
  let areaPath = "";

  const heightWithPadding = viewBoxHeight + 16;

  // The latest point on the x axis, starting at 0 until `viewBoxWidth`
  let lastWidthPoint = viewBoxWidth;

  // The amount of points on the x axis
  const widthIteration = viewBoxWidth / 52;

  // The highest value on the y axis
  const commitCountArray: number[] = [];

  // The minimal amplitude shown e.g. commitCount = 1 => `minimalHeight` points of height in the SVG.
  const minimalHeight = 5;

  let week = 0;

  for (const point of points) {
    if (point.week - week > 1) {
      commitCountArray.push(...new Array(point.week - week).fill(0));
    }
    commitCountArray.push(point.commits.length);
    week = point.week;
  }

  // Formats the points passed in, into a svg path string, without closing the area
  function createPath() {
    let i = 1;

    if (commitCountArray.length < 52) {
      commitCountArray.push(...new Array(52 - commitCountArray.length).fill(0));
    }

    const maxValue = Math.max(...commitCountArray);
    const minValue = Math.min(...commitCountArray);

    // Normalizes the values to the viewBox dimensions
    const normalizedArray = commitCountArray.map(c => {
      // If we are not crossing the `viewBoxHeight` we want to return the actual value,
      // and don't want to normalize <`minimalHeight` commit counts as huge spikes.
      if (maxValue < viewBoxHeight && c >= minimalHeight) {
        return c;
      }
      // If the value is 0..minimalHeight though we don't want to set it to the minimalHeight.
      else if (c > 0 && c < minimalHeight) {
        return minimalHeight;
      }
      // If the count is 0 we have to make sure the normalization is not being run since it would return NaN
      else {
        return c === 0
          ? 0
          : ((viewBoxHeight - 0) * (c - minValue)) / (maxValue - minValue);
      }
    });

    const path = normalizedArray.slice(1).reduce(
      (acc, curr) => {
        const s = `${viewBoxWidth - widthIteration * i},${
          viewBoxHeight - curr
        }`;
        lastWidthPoint = viewBoxWidth - widthIteration * i;
        i += 1;
        return acc.concat(s);
      },
      [`M${viewBoxWidth},${viewBoxHeight - normalizedArray[0]}`],
    );
    return path.join();
  }

  onMount(() => {
    // Creates the stroke path with the array of points
    path = createPath();
    // Concats a path closing for it to be the area under the stroke
    areaPath = path.concat(
      `L${lastWidthPoint},${viewBoxHeight}L${viewBoxWidth},${viewBoxHeight}Z`,
    );
  });
</script>

<svg
  viewBox="0 0 {viewBoxWidth} {heightWithPadding}"
  xmlns="http://www.w3.org/2000/svg">
  <svg style="height: 0; width: 0;" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="fillGradient" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stop-color="#ff55ff" stop-opacity="0" />
        <stop offset="100%" stop-color="#ff55ff" stop-opacity="0.2" />
      </linearGradient>
    </defs>
  </svg>
  {#if points.length > 0}
    <g>
      <path
        fill="transparent"
        stroke="url(#gradient)"
        stroke-width={strokeWidth}
        stroke-linejoin="round"
        d={path} />
      <path fill="url(#fillGradient)" stroke="transparent" d={areaPath} />
    </g>
  {:else}
    <!-- If no commits have been made in a year, we show a straight line -->
    <line
      x1="0"
      y1={viewBoxHeight}
      x2="600"
      y2={viewBoxHeight}
      stroke="#ff55ff"
      stroke-width={1} />
  {/if}
</svg>
