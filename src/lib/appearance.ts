import { writable } from "svelte/store";

export type Theme = "dark" | "light";
export const followSystemTheme = writable<boolean>(shouldFollowSystemTheme());
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

function shouldFollowSystemTheme(): boolean {
  const storedTheme = localStorage ? localStorage.getItem("theme") : null;
  if (storedTheme === null) {
    return true; // default to following the system theme
  } else {
    return storedTheme === "system";
  }
}

function loadTheme(): Theme {
  const { matches } = window.matchMedia("(prefers-color-scheme: dark)");
  const storedTheme = localStorage ? localStorage.getItem("theme") : null;

  if (storedTheme === null || storedTheme === "system") {
    return matches ? "dark" : "light";
  } else {
    return storedTheme as Theme;
  }
}

export function storeTheme(newTheme: Theme | "system"): void {
  followSystemTheme.set(newTheme === "system" ? true : false);
  if (localStorage) {
    localStorage.setItem("theme", newTheme);
  } else {
    console.warn(
      "localStorage isn't available, not able to persist the selected theme without it.",
    );
  }
  if (newTheme !== "system") {
    // update the theme to newTheme
    theme.set(newTheme);
  } else {
    // update the theme to the current system theme
    theme.set(
      window.matchMedia("(prefers-color-scheme: dark)") ? "dark" : "light",
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
