import highlightsJs from "@app/lib/syntax/js-highlights.scm?raw";
import localsJs from "@app/lib/syntax/js-locals.scm?raw";
import injectionsJs from "@app/lib/syntax/js-injections.scm?raw";
import highlightsTs from "@app/lib/syntax/ts-highlights.scm?raw";
import localsTs from "@app/lib/syntax/ts-locals.scm?raw";
import highlightsJson from "@app/lib/syntax/json-highlights.scm?raw";
import highlightsJsdoc from "@app/lib/syntax/jsdoc-highlights.scm?raw";
import highlightsYaml from "@app/lib/syntax/yaml-highlights.scm?raw";
import highlightsToml from "@app/lib/syntax/toml-highlights.scm?raw";
import highlightsHtml from "@app/lib/syntax/html-highlights.scm?raw";
import injectionsHtml from "@app/lib/syntax/html-injections.scm?raw";
import highlightsSvelte from "@app/lib/syntax/svelte-highlights.scm?raw";
import injectionsSvelte from "@app/lib/syntax/svelte-injections.scm?raw";
import localsSvelte from "@app/lib/syntax/svelte-locals.scm?raw";
import highlightsRust from "@app/lib/syntax/rust-highlights.scm?raw";
import injectionsRust from "@app/lib/syntax/rust-injections.scm?raw";
import highlightsCss from "@app/lib/syntax/css-highlights.scm?raw";
import treeSitterJavascript from "@app/lib/syntax/tree-sitter-javascript.wasm?url";
import treeSitterJsdoc from "@app/lib/syntax/tree-sitter-jsdoc.wasm?url";
import treeSitterYaml from "@app/lib/syntax/tree-sitter-yaml.wasm?url";
import treeSitterTypescript from "@app/lib/syntax/tree-sitter-typescript.wasm?url";
import treeSitterToml from "@app/lib/syntax/tree-sitter-toml.wasm?url";
import treeSitterCss from "@app/lib/syntax/tree-sitter-css.wasm?url";
import treeSitterHtml from "@app/lib/syntax/tree-sitter-html.wasm?url";
import treeSitterRust from "@app/lib/syntax/tree-sitter-rust.wasm?url";
import treeSitterSvelte from "@app/lib/syntax/tree-sitter-svelte.wasm?url";
import treeSitterJson from "@app/lib/syntax/tree-sitter-json.wasm?url";

export const languageMap: Record<string, { language: string; query: string }> =
  {
    ts: {
      language: treeSitterTypescript,
      query: highlightsJs.concat(highlightsTs, localsTs),
    },
    js: {
      language: treeSitterJavascript,
      query: highlightsJs.concat(localsJs, injectionsJs),
    },
    cjs: {
      language: treeSitterJavascript,
      query: highlightsJs.concat(localsJs, injectionsJs),
    },
    mjs: {
      language: treeSitterJavascript,
      query: highlightsJs.concat(localsJs, injectionsJs),
    },
    yml: {
      language: treeSitterYaml,
      query: highlightsYaml,
    },
    toml: {
      language: treeSitterToml,
      query: highlightsToml,
    },
    jsdoc: {
      language: treeSitterJsdoc,
      query: highlightsJsdoc,
    },
    css: {
      language: treeSitterCss,
      query: highlightsCss,
    },
    svelte: {
      language: treeSitterSvelte,
      query: injectionsSvelte.concat(localsSvelte, highlightsSvelte),
    },
    json: {
      language: treeSitterJson,
      query: highlightsJson,
    },
    html: {
      language: treeSitterHtml,
      query: injectionsHtml.concat(highlightsHtml),
    },
    rs: {
      language: treeSitterRust,
      query: highlightsRust.concat(injectionsRust),
    },
  };
