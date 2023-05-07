import emojis from "@app/lib/emojis";
import katex from "katex";
import { marked } from "marked";
import { isUrl } from "./utils";

// TODO: Disables deprecated options, remove once removed from marked
marked.use({ mangle: false, headerIds: false });

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
  renderer: (token: marked.Tokens.Generic) => {
    return `<span>${
      token.text in emojis ? emojis[token.text] : token.text
    }</span>`;
  },
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
  renderer: (token: marked.Tokens.Generic) =>
    katex.renderToString(token.text, {
      throwOnError: false,
    }),
};
const footnotePrefix = "marked-fn";
const referencePrefix = "marked-fnref";
const referenceMatch = /^\[\^([^\]]+)\](?!\()/;

const footnoteReferenceMarkedExtension = {
  name: "footnote-ref",
  level: "inline",
  start: (src: string) => referenceMatch.test(src),
  tokenizer(src: string) {
    const match = src.match(referenceMatch);
    if (match) {
      return {
        type: "footnote-ref",
        raw: match[0],
        text: match[1].trim(),
      };
    }
  },
  renderer: (token: marked.Tokens.Generic) => {
    return `<sup class="footnote-ref" id="${referencePrefix}:${token.text}"><a href="#${footnotePrefix}:${token.text}">[${token.text}]</a></sup>`;
  },
};
const footnoteMatch = /^\[\^([^\]]+)\]:\s([\S]*)/;
const footnoteMarkedExtension = {
  name: "footnote",
  level: "block",
  start: (src: string) => footnoteMatch.test(src),
  tokenizer(src: string) {
    const match = src.match(footnoteMatch);
    if (match) {
      return {
        type: "footnote",
        raw: match[0],
        reference: match[1].trim(),
        text: match[2].trim(),
      };
    }
  },
  renderer: (token: marked.Tokens.Generic) => {
    return `<p class="txt-small" id="${footnotePrefix}:${token.reference}">${
      token.reference
    }. ${marked.parseInline(
      token.text,
    )} <a class="txt-tiny ref-arrow" href="#${referencePrefix}:${
      token.reference
    }">↩</a></p>`;
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
  listitem(text: string) {
    const hasLineBreaks = text.trim().indexOf("\n");
    if (hasLineBreaks === -1) {
      return `<li>${text}</li>`;
    }
    const [first, ...remaining] = text.trim().split("\n");
    const liContent = `${first}<div class="list-content">${remaining.join(
      "\n",
    )}</div>`;
    return `<li>${liContent}</li>`;
  },
  link(href: string, _title: string, text: string) {
    // If the link is not a URL nor starts with a #, we add the file-link class to it,
    // so we're able to query it in the Markdown component.
    if (!isUrl(href) && !href.startsWith("#")) {
      return `<a href="${href}" class="file-link">${text}</a>`;
    }
    return `<a href="${href}">${text}</a>`;
  },
};

export const markdownExtensions = [
  anchorMarkedExtension,
  emojisMarkedExtension,
  footnoteMarkedExtension,
  footnoteReferenceMarkedExtension,
  katexMarkedExtension,
];
