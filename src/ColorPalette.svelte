<script lang="ts">
  function extractCssVariables(variableName: string) {
    return Array.from(document.styleSheets)
      .filter(
        sheet =>
          sheet.href === null || sheet.href.startsWith(window.location.origin),
      )
      .reduce<string[]>(
        (acc, sheet) =>
          (acc = [
            ...acc,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ...Array.from(sheet.cssRules).reduce(
              (def, rule) =>
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                (def =
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  rule.selectorText === ":root"
                    ? [
                        ...def,
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        ...Array.from(rule.style).filter(name =>
                          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                          // @ts-ignore
                          name.startsWith(variableName),
                        ),
                      ]
                    : def),
              [],
            ),
          ]),
        [],
      );
  }

  // rg "\--color-\w*(-\d)*" -o --no-line-number --no-filename -g "\!public/colors.css" -g "\!src/ColorPalette.svelte" | sort | uniq | jq -sRM 'split("\n")[:-1]'
  const usedColors = [
    "--color-background",
    "--color-caution",
    "--color-caution-2",
    "--color-caution-3",
    "--color-caution-6",
    "--color-foreground",
    "--color-foreground-1",
    "--color-foreground-2",
    "--color-foreground-3",
    "--color-foreground-4",
    "--color-foreground-5",
    "--color-foreground-6",
    "--color-negative",
    "--color-negative-1",
    "--color-negative-2",
    "--color-negative-3",
    "--color-negative-4",
    "--color-negative-5",
    "--color-negative-6",
    "--color-positive",
    "--color-positive-1",
    "--color-positive-2",
    "--color-positive-3",
    "--color-positive-6",
    "--color-primary",
    "--color-primary-3",
    "--color-primary-5",
    "--color-secondary",
    "--color-secondary-1",
    "--color-secondary-2",
    "--color-secondary-3",
    "--color-secondary-5",
    "--color-secondary-6",
    "--color-tertiary",
    "--color-tertiary-1",
    "--color-tertiary-2",
    "--color-tertiary-6",
  ];

  const colors = extractCssVariables("--color");
  const colorGroups = [
    ...new Set(
      colors.map(color => {
        const match = color.match(/--color-(\w*)-?/);
        if (match) {
          return match[1];
        } else {
          return "";
        }
      }),
    ),
  ];

  let show = false;
  let checkers = false;

  const onKeydown = (event: KeyboardEvent) => {
    const hasInputTarget =
      event.target &&
      ((event.target as HTMLInputElement).type === "text" ||
        (event.target as HTMLTextAreaElement).type === "textarea");

    if (
      hasInputTarget ||
      event.repeat ||
      event.altKey ||
      event.metaKey ||
      event.ctrlKey
    ) {
      return false;
    }

    if (event.key === "d") {
      show = !show;
    }
  };

  function clickOutside(ev: MouseEvent) {
    if (thisComponent && !thisComponent.contains(ev.target as HTMLDivElement)) {
      show = !show;
    }
  }

  let thisComponent: HTMLDivElement;
</script>

<style>
  .container {
    position: fixed;
    background: var(--color-background);
    padding: 2rem;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    box-shadow: var(--elevation-low);
    border-radius: 1rem;
    z-index: 100;
    min-width: 46rem;
  }

  .checkers {
    background: repeating-conic-gradient(#88888833 0% 25%, transparent 0% 50%)
      50% / 20px 20px;
    border-radius: 1rem;
  }

  .color {
    width: 4rem;
    height: 4rem;
    border-radius: 0.5rem;
    outline-style: solid !important;
    outline-color: #88888899 !important;
    outline-offset: 0.5rem;
    margin: 1rem;
  }

  .unused {
    outline-style: dotted !important;
    outline-color: #55555555 !important;
  }
</style>

<svelte:window on:keydown={onKeydown} on:click={clickOutside} />

{#if show}
  <div
    bind:this={thisComponent}
    class="container"
    on:click={() => (checkers = !checkers)}>
    <div class:checkers>
      {#each colorGroups as colorGroup}
        <div>
          {#each colors.filter(color => {
            return color.match(`--color-${colorGroup}`);
          }) as color}
            <div style="display: inline-flex;">
              <div
                class:unused={!usedColors.includes(color)}
                title={color}
                class="color"
                style={`background-color: var(${color});`} />
            </div>
          {/each}
        </div>
      {/each}
    </div>
  </div>
{/if}
