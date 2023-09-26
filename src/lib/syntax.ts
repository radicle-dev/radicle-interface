import type { ElementContent, Root } from "hast";

import onigurumaWASMUrl from "vscode-oniguruma/release/onig.wasm?url";
import sourceAsciiDoc from "@wooorm/starry-night/text.html.asciidoc";
import sourceDockerfile from "@wooorm/starry-night/source.dockerfile";
import sourceErlang from "@wooorm/starry-night/source.erlang";
import sourceSolidity from "@wooorm/starry-night/source.solidity";
import sourceSvelte from "@wooorm/starry-night/source.svelte";
import sourceToml from "@wooorm/starry-night/source.toml";
import sourceTsx from "@wooorm/starry-night/source.tsx";
import { createStarryNight, common } from "@wooorm/starry-night";

export { type Root };

export const grammars = [
  ...common,
  sourceSvelte,
  sourceSolidity,
  sourceTsx,
  sourceErlang,
  sourceDockerfile,
  sourceAsciiDoc,
  sourceToml,
  // A grammar that doesn't do any parsing, but needed for files without a known filetype.
  {
    extensions: [""],
    names: ["raw-format"],
    patterns: [],
    scopeName: "text.raw",
  },
];

let starryNight: Awaited<ReturnType<typeof createStarryNight>>;

export async function highlight(
  content: string,
  grammar: string,
): Promise<Root> {
  if (starryNight === undefined) {
    starryNight = await createStarryNight(grammars, {
      getOnigurumaUrlFetch: () => new URL(onigurumaWASMUrl, import.meta.url),
    });
  }
  const scope = starryNight.flagToScope(grammar);
  return starryNight.highlight(content, scope ?? "text.raw");
}

export function lineNumbersGutter(tree: Root) {
  const replacement: ElementContent[] = [];
  const search = /\r?\n|\r/g;
  let index = -1;
  let start = 0;
  let startTextRemainder = "";
  let lineNumber = 0;

  while (++index < tree.children.length) {
    const child = tree.children[index];

    if (child.type === "text") {
      let textStart = 0;
      let match = search.exec(child.value);

      while (match) {
        // Nodes in this line.
        const line = tree.children.slice(start, index) as ElementContent[];

        // Prepend text from a partial matched earlier text.
        if (startTextRemainder) {
          line.unshift({ type: "text", value: startTextRemainder });
          startTextRemainder = "";
        }

        // Append text from this text.
        if (match.index > textStart) {
          line.push({
            type: "text",
            value: child.value.slice(textStart, match.index),
          });
        }

        // Add a line, and the eol.
        lineNumber += 1;
        replacement.push(createLine(line, lineNumber), {
          type: "text",
          value: match[0],
        });

        start = index + 1;
        textStart = match.index + match[0].length;
        match = search.exec(child.value);
      }

      // If we matched, make sure to not drop the text after the last line ending.
      if (start === index + 1) {
        startTextRemainder = child.value.slice(textStart);
      }
    }
  }

  const line = tree.children.slice(start) as ElementContent[];
  // Prepend text from a partial matched earlier text.
  if (startTextRemainder) {
    line.unshift({ type: "text", value: startTextRemainder });
    startTextRemainder = "";
  }

  if (line.length > 0) {
    lineNumber += 1;
    replacement.push(createLine(line, lineNumber));
  }

  // Replace children with new array.
  tree.children = replacement;

  return tree;
}

function createLine(children: ElementContent[], line: number): ElementContent {
  return {
    type: "element",
    tagName: "tr",
    properties: {
      class: "line",
      id: "L" + line,
    },
    children: [
      {
        type: "element",
        tagName: "td",
        properties: {
          className: "line-number",
        },
        children: [
          {
            type: "element",
            tagName: "a",
            properties: { href: "#L" + line },
            children: [{ type: "text", value: line.toString() }],
          },
        ],
      },
      {
        type: "element",
        tagName: "td",
        properties: {
          className: "line-content",
        },
        children: [
          {
            type: "element",
            tagName: "pre",
            properties: {
              className: "content",
            },
            children,
          },
        ],
      },
    ],
  };
}
