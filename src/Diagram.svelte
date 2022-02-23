<script lang="ts">
  import { onMount } from "svelte";
  import type { CommitGroup } from "./commit";

  export let strokeWidth: number;
  export let points: CommitGroup[];
  export let strokeColor = "#ff55ff";
  export let viewBoxWidth: number;
  export let viewBoxHeight: number;

  // The path strings to be inserted into the svg <path>
  let path = "";
  let areaPath = "";

  let heightWithPadding = viewBoxHeight + 10;

  // The latest point on the x axis, starting at 0 until `viewBoxWidth`
  let lastWidthPoint = viewBoxWidth;

  // The amount of points on the x axis
  const widthIteration = viewBoxWidth / 52;

  // The highest value on the y axis
  let commitCountArray: number[] = [];

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

    if (commitCountArray.length < 52) commitCountArray.push(...new Array(52 - commitCountArray.length).fill(0));

    let maxValue = Math.max(...commitCountArray);
    let minValue = Math.min(...commitCountArray);

    // Normalizes the values to the viewBox dimensions
    let normalizedArray =
      commitCountArray.map(c =>
        // When max and min value are 0 we want to make sure the normalization is not being run since it would return NaN
        c === 0 ? 0 : (viewBoxHeight - 0) * (c - minValue) / (maxValue - minValue)
      );

    let path = normalizedArray
      .slice(1)
      .reduce((acc, curr) => {
        let s = `${viewBoxWidth - widthIteration * i},${viewBoxHeight - curr}`;
        lastWidthPoint = viewBoxWidth - widthIteration * i;
        i += 1;
        return acc.concat(s);
      },
      [`M${viewBoxWidth},${viewBoxHeight - normalizedArray[0]}`]);
    return path.join();
  }

  onMount(() => {
    // Creates the stroke path with the array of points
    path = createPath();
    // Concats a path closing for it to be the area under the stroke
    areaPath = path.concat(`L${lastWidthPoint},${heightWithPadding}L${viewBoxWidth},${viewBoxHeight+10}Z`);
  });
</script>

<svg viewBox="0 0 {viewBoxWidth} {heightWithPadding}" xmlns="http://www.w3.org/2000/svg">
  <use fill="url(#gradient)" />
  <g>
    <path fill="transparent" stroke={strokeColor} stroke-width={strokeWidth} d={path} />
    <path fill="url('#gradient')" stroke="transparent" d={areaPath} />
  </g>
</svg>
