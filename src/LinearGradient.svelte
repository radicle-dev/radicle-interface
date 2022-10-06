<script lang="ts">
  export let fillColor = "#ff55ff";
  export let id: string;
</script>

<svg style="height: 0; width: 0;" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient {id} x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color={fillColor} stop-opacity="0.2" />
      <stop offset="50%" stop-color={fillColor} stop-opacity="0.8" />
      <stop offset="100%" stop-color={fillColor} stop-opacity="1" />
    </linearGradient>
  </defs>
</svg>
