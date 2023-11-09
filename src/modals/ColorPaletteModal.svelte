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

  // rg "\--color-\w*-\w*" -o --no-line-number --no-filename -g "\!public/colors.css" -g "\!ColorPaletteModal.svelte" | sort | uniq | jq -sRM 'split("\n")[:-1]'
  const usedColors = [
    "--color-background-default",
    "--color-background-dip",
    "--color-background-float",
    "--color-border-default",
    "--color-border-error",
    "--color-border-focus",
    "--color-border-hint",
    "--color-border-match",
    "--color-border-merged",
    "--color-fill-contrast",
    "--color-fill-diff",
    "--color-fill-float",
    "--color-fill-ghost",
    "--color-fill-gray",
    "--color-fill-merged",
    "--color-fill-primary",
    "--color-fill-secondary",
    "--color-fill-separator",
    "--color-fill-success",
    "--color-fill-yellow",
    "--color-foreground-black",
    "--color-foreground-contrast",
    "--color-foreground-default",
    "--color-foreground-dim",
    "--color-foreground-disabled",
    "--color-foreground-emphasized",
    "--color-foreground-gray",
    "--color-foreground-match",
    "--color-foreground-primary",
    "--color-foreground-red",
    "--color-foreground-success",
    "--color-foreground-white",
    "--color-foreground-yellow",
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

<Modal>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div slot="body">
    <div
      role="button"
      tabindex="0"
      class="container"
      on:click={() => (checkers = !checkers)}>
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
