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
  const storedCodeFont = window.localStorage.getItem("codefont");

  if (storedCodeFont === null) {
    return "jetbrains";
  } else {
    return storedCodeFont as CodeFont;
  }
}

function loadTheme(): Theme {
  const storedTheme = window.localStorage.getItem("theme");

  if (storedTheme === null) {
    return "dark";
  } else {
    return storedTheme as Theme;
  }
}

export function storeTheme(newTheme: Theme): void {
  theme.set(newTheme);
  window.localStorage.setItem("theme", newTheme);
}

export function storeCodeFont(newCodeFont: CodeFont): void {
  codeFont.set(newCodeFont);
  window.localStorage.setItem("codefont", newCodeFont);
}

export const experimental = writable<true | undefined>(
  loadExperimentalSetting(),
);

function loadExperimentalSetting(): true | undefined {
  const storedExperimental = window.localStorage.getItem("experimental");

  if (storedExperimental === null) {
    return undefined;
  } else {
    return storedExperimental === "true" ? true : undefined;
  }
}

export function storeExperimental(newSetting: true | undefined): void {
  experimental.set(newSetting);
  window.localStorage.setItem(
    "experimental",
    newSetting === true ? "true" : "undefined",
  );
}
