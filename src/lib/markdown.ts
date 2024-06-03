import type { MarkedExtension, Tokens } from "marked";
import type { Route } from "@app/lib/router";

import dompurify from "dompurify";
import katexMarkedExtension from "marked-katex-extension";
import markedLinkifyIt from "marked-linkify-it";
import { Marked, Renderer as BaseRenderer } from "marked";

import emojis from "@app/lib/emojis";
import { routeToPath } from "@app/lib/router";
import { canonicalize, isUrl } from "@app/lib/utils";

dompurify.setConfig({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  SANITIZE_DOM: false,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  FORBID_TAGS: ["textarea", "style"],
});

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
  renderer: (token: Tokens.Generic): string =>
    `<span>${token.text in emojis ? emojis[token.text] : token.text}</span>`,
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
  renderer: (token: Tokens.Generic): string =>
    `<sup class="txt-tiny footnote-ref" id="${referencePrefix}:${token.text}"><a href="#${footnotePrefix}:${token.text}">[${token.text}]</a></sup>`,
};
const footnoteMatch = /^\[\^([^\]]+)\]:\s([\S].*)/;
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
  renderer: (token: Tokens.Generic): string =>
    `<p class="txt-small footnote" id="${footnotePrefix}:${
      token.reference
    }"><span class="marker">${token.reference}.</span> ${markdownWithExtensions.parseInline(
      token.text,
    )} <a class="txt-tiny ref-arrow no-underline" href="#${referencePrefix}:${
      token.reference
    }">↩</a></p>`,
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
  renderer: (token: Tokens.Generic): string => `<a name="${token.text}"></a>`,
};

export class Renderer extends BaseRenderer {
  #route: Route;
  #stripEmphasizedStyling: boolean | undefined;

  /**
   * If `baseUrl` is provided, all hrefs attributes in anchor tags, except those
   * starting with `#`, are resolved with respect to `baseUrl`
   */
  constructor(
    activeUnloadedRoute: Route,
    { stripEmphasizedStyling }: { stripEmphasizedStyling: boolean },
  ) {
    super();
    this.#route = activeUnloadedRoute;
    this.#stripEmphasizedStyling = stripEmphasizedStyling;
  }
  // Overwrites the rendering of heading tokens.
  // Since there are possible non ASCII characters in headings,
  // we escape them by replacing them with dashes and,
  // trim eventual dashes on each side of the string.
  heading(text: string, level: 1 | 2 | 3 | 4 | 5 | 6) {
    const escapedText = text
      // By lowercasing we avoid casing mismatches, between headings and links.
      .toLowerCase()
      .replace(/[^\w]+/g, "-")
      .replace(/^-|-$/g, "");

    return `<h${level} id="${escapedText}">${text}</h${level}>`;
  }

  strong(text: string) {
    return this.#stripEmphasizedStyling ? text : `<strong>${text}</strong>`;
  }

  em(text: string) {
    return this.#stripEmphasizedStyling ? text : `<em>${text}</em>`;
  }

  link(href: string, title: string | undefined | null, text: string): string {
    if (href.startsWith("#")) {
      // By lowercasing we avoid casing mismatches, between headings and links.
      return `<a ${title ? `title="${title}"` : ""} href="${href.toLowerCase()}">${text}</a>`;
    }

    if ("path" in this.#route && !isUrl(href)) {
      href = routeToPath({
        ...this.#route,
        path: canonicalize(href, this.#route.path || "README.md"),
        route: undefined,
      });
    }

    return `<a ${title ? `title="${title}"` : ""} href="${href}">${text}</a>`;
  }
}

function markedCustomExtensions(): MarkedExtension {
  return {
    extensions: [
      emojisMarkedExtension,
      footnoteMarkedExtension,
      footnoteReferenceMarkedExtension,
      anchorMarkedExtension,
    ],
  };
}

export default new Marked();

export const markdownWithExtensions = new Marked(
  katexMarkedExtension({ throwOnError: false }),
  markedLinkifyIt({}, { fuzzyLink: false }),
  markedCustomExtensions(),
);
