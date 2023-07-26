import Parser from "@app/vendor/tree-sitter/tree-sitter";
import treeSitterWasm from "@app/vendor/tree-sitter/tree-sitter.wasm?url";
import { languageMap } from "@app/lib/syntax/languages";

// Contains the data needed to highlight code written in a particular language.
export class HighlightConfiguration {
  public readonly language: Parser.Language;
  public readonly query: Parser.Query;

  private constructor(language: Parser.Language, query: Parser.Query) {
    this.language = language;
    this.query = query;
  }

  public static async create(fileExtension: string) {
    if (!(fileExtension in languageMap)) {
      console.warn(`Language for ${fileExtension} not found`);
      return;
    }
    const language = await Parser.Language.load(
      languageMap[fileExtension].language,
    );
    const query = language.query(languageMap[fileExtension].query);

    return new HighlightConfiguration(language, query);
  }
}

// Performs syntax highlighting, recognizing a given list of highlight names.
//
// For the best performance `Highlighter` should be reused between syntax highlighting calls.
export class Highlighter {
  #parser: Parser;

  private constructor(parser: Parser) {
    this.#parser = parser;
  }

  public static async init() {
    await Parser.init({
      locateFile() {
        return treeSitterWasm;
      },
    });
    const parser = new Parser();
    return new Highlighter(parser);
  }

  public setLanguage(language: Parser.Language) {
    this.#parser.setLanguage(language);
  }

  public async parse(text: string) {
    return this.#parser.parse(text);
  }
}

// Calculate the specificity of a highlight class
// https://tree-sitter.github.io/tree-sitter/syntax-highlighting#highlight-names
function calculateSpecificity(tokenName: string) {
  return tokenName.split(".").length;
}

export function renderHTML(captures: Parser.QueryCapture[], source: string) {
  let highlightedSource: string = "";
  let currentCursor = 0;
  const matchedIds: Record<number, string> = {};

  if (captures.length > 0) {
    captures.forEach(token => {
      // TODO: We should take into account local scopes, etc.
      // https://tree-sitter.github.io/tree-sitter/syntax-highlighting#local-variables

      // If the current cursor already passed, the new token, just return early
      if (token.node.startIndex < currentCursor) {
        return;
      }
      // If there are two tokens with the same id,
      // and the new one is lower in specificity just return early.
      if (
        matchedIds[token.node.id] &&
        calculateSpecificity(token.name) <
          calculateSpecificity(matchedIds[token.node.id])
      ) {
        return;
      } else if (matchedIds[token.node.id]) {
        return;
      }
      // Add the matched token to the matchedIds
      matchedIds[token.node.id] = token.name;

      // Add to the highlightedSource the text between
      // the end of the last token and the start of the current token
      highlightedSource += source.substring(
        currentCursor,
        token.node.startIndex,
      );

      // Add the new token to the highlightedSource embedded between a span
      highlightedSource += `<span class="syntax ${token.name.replace(
        ".",
        " ",
      )}">${escapeHtml(token.node.text)}</span>`;
      currentCursor = token.node.endIndex;
    });
  } else {
    highlightedSource += source;
  }
  // Add the remaining text after the last token
  const lastFoundToken = captures[captures.length - 1];
  if (lastFoundToken) {
    highlightedSource += source.substring(lastFoundToken.node.endIndex);
  }
  return highlightedSource.split("\n");
}

export function escapeHtml(unsafeHtml: string) {
  return unsafeHtml.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function handleInjections(
  injection: Parser.QueryCapture,
  highlighter: Highlighter,
  highlightConfiguration: HighlightConfiguration,
  baseLanguage?: string,
): Promise<Parser.QueryCapture[]> {
  if (injection.name === "injection.content") {
    if (baseLanguage !== injection.setProperties["injection.language"]) {
    const injectionConfiguration = await HighlightConfiguration.create(
      injection.setProperties["injection.language"],
    );
    if (!injectionConfiguration) {
      return [injection];
    }
    highlightConfiguration = injectionConfiguration;
    highlighter.setLanguage(highlightConfiguration.language);
  }

    const result = await highlighter.parse(injection.node.text);
    const captures: Parser.QueryCapture[] = (
      await Promise.all(
        highlightConfiguration.query
          .captures(result.rootNode)
          .map(async capture => await handleInjections(capture, highlighter, highlightConfiguration, baseLanguage)),
      )
    ).flat();

    // Since the injection is being parsed in isolation, we need to adjust the indexes
    return captures.map(capture => ({
      ...capture,
      node: {
        ...capture.node,
        startIndex: capture.node.startIndex + injection.node.startIndex,
        endIndex:
          capture.node.startIndex +
          injection.node.startIndex +
          capture.node.text.length,
        id: capture.node.id,
        text: capture.node.text,
      },
    }));
  } else {
    return [injection];
  }
}
