import { writable } from "svelte/store";

export type Theme = "dark" | "light";
export const theme = writable<Theme>(loadTheme());

export type CodeFont = "jetbrains" | "system";
export const codeFont = writable<CodeFont>(loadCodeFont());

export const codeFonts: {
  storedName: CodeFont;
  fontFamily: string;
  displayName: string;
}[] = [
  {
    storedName: "jetbrains",
    fontFamily: "JetBrains Mono",
    displayName: "JetBrains Mono",
  },
  { storedName: "system", fontFamily: "monospace", displayName: "System" },
];

function loadCodeFont(): CodeFont {
  const storedCodeFont = localStorage ? localStorage.getItem("codefont") : null;

  if (storedCodeFont === null) {
    return "jetbrains";
  } else {
    return storedCodeFont as CodeFont;
  }
}

function loadTheme(): Theme {
  const { matches } = window.matchMedia("(prefers-color-scheme: dark)");
  const storedTheme = localStorage ? localStorage.getItem("theme") : null;

  if (storedTheme === null) {
    return matches ? "dark" : "light";
  } else {
    return storedTheme as Theme;
  }
}

export function storeTheme(newTheme: Theme): void {
  theme.set(newTheme);
  if (localStorage) {
    localStorage.setItem("theme", newTheme);
  } else {
    console.warn(
      "localStorage isn't available, not able to persist the selected theme without it.",
    );
  }
}

export function storeCodeFont(newCodeFont: CodeFont): void {
  codeFont.set(newCodeFont);
  if (localStorage) {
    localStorage.setItem("codefont", newCodeFont);
  } else {
    console.warn(
      "localStorage isn't available, not able to persist the selected code font without it.",
    );
  }
}
