<script lang="ts">
  import Modal from "@app/components/Modal.svelte";

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
    "--color-tertiary-3",
    "--color-tertiary-6",
  ];

  const colors = extractCssVariables("--color").filter(c => {
    return !c.startsWith("--color-prettylights-syntax");
  });

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

  let checkers = false;
</script>

<style>
  .checkers {
    background: repeating-conic-gradient(#88888833 0% 25%, transparent 0% 50%)
      50% / 20px 20px;
    border-radius: 1rem;
  }

  .container {
    display: flex;
    margin: 0;
    padding: 0;
  }

  .color {
    width: 3rem;
    height: 3rem;
    border-radius: 0.5rem;
    outline-style: solid !important;
    outline-color: #88888899 !important;
    outline-offset: 0.3rem;
    margin: 1rem;
  }

  .unused {
    outline-style: dotted !important;
    outline-color: #55555555 !important;
  }
</style>

<Modal closeAction={false}>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div slot="body">
    <div class="container" on:click={() => (checkers = !checkers)}>
      <div class:checkers>
        {#each colorGroups as colorGroup}
          <div style:display="flex">
            {#each colors.filter(color => {
              return color.match(`--color-${colorGroup}`);
            }) as color}
              <div style:display="inline-flex">
                <div
                  class:unused={!usedColors.includes(color)}
                  title={color}
                  class="color"
                  style:background-color={`var(${color})`} />
              </div>
            {/each}
          </div>
        {/each}
      </div>
    </div>
  </div>
</Modal>
