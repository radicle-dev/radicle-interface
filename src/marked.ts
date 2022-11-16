import type { marked } from "marked";
import katex from "katex";

const emojisMarkedExtension = {
  name: "emoji",
  level: "inline",
  start: (src: string) => src.indexOf(":"),
  tokenizer(src: string) {
    const match = src.match(/^:([\w+-]+):/);
    if (match) {
      return {
        type: "emoji",
        raw: match[0],
        text: match[1].trim(),
      };
    }
  },
  renderer: (token: marked.Tokens.Generic) =>
    `<span>${parseEmoji(token.text)}</span>`,
};

const katexMarkedExtension = {
  name: "katex",
  level: "inline",
  start: (src: string) => src.indexOf("$"),
  tokenizer(src: string) {
    const match = src.match(/^\$+([^$\n]+?)\$+/);
    if (match) {
      return {
        type: "katex",
        raw: match[0],
        text: match[1].trim(),
      };
    }
  },
  renderer: (token: marked.Tokens.Generic) => {
    return katex.renderToString(token.text, {
      throwOnError: false,
    });
  },
};

// Converts self closing anchor tags into empty anchor tags, to avoid erratic wrapping behaviour
// e.g. <a name="test"/> -> <a name="test"></a>
const anchorMarkedExtension = {
  name: "sanitizedAnchor",
  level: "block",
  start: (src: string) => src.match(/<a name="([\w]+)"\/>/)?.index,
  tokenizer(src: string) {
    const match = src.match(/^<a name="([\w]+)"\/>/);
    if (match) {
      return {
        type: "sanitizedAnchor",
        raw: match[0],
        text: match[1].trim(),
      };
    }
  },
  renderer: (token: marked.Tokens.Generic) => {
    return `<a name="${token.text}"></a>`;
  },
};

// Overwrites the rendering of heading tokens.
// Since there are possible non ASCII characters in headings,
// we escape them by replacing them with dashes and,
// trim eventual dashes on each side of the string.
export const renderer = {
  heading(text: string, level: 1 | 2 | 3 | 4 | 5 | 6) {
    const escapedText = text
      .toLowerCase()
      .replace(/[^\w]+/g, "-")
      .replace(/^-|-$/g, "");

    return `<h${level} id="${escapedText}">${text}</h${level}>`;
  },
};

export const markdownExtensions = [
  emojisMarkedExtension,
  katexMarkedExtension,
  anchorMarkedExtension,
];
