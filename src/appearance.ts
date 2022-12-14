import { writable } from "svelte/store";

export type CodeFont = typeof codeFonts[number]["storedName"];
export const codeFont = writable<CodeFont>(loadCodeFont());

export function storeCodeFont(codeFont: CodeFont): void {
  window.localStorage.setItem("codefont", codeFont);
}

function loadCodeFont(): CodeFont {
  const storedCodeFont = window.localStorage.getItem("codefont");

  if (storedCodeFont === null) {
    return "jetbrains";
  } else {
    return storedCodeFont as CodeFont;
  }
}

export const codeFonts = [
  {
    storedName: "jetbrains",
    fontFamily: "JetBrains Mono",
    displayName: "JetBrains Mono",
  },
  { storedName: "system", fontFamily: "monospace", displayName: "System" },
] as const;
