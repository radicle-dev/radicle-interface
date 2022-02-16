import Search from "./Search.svelte";
import { screen, render, fireEvent } from "@testing-library/svelte";
import { describe, test } from "vitest";

describe('Search', function () {
  test("Renders correctly", async () => {
    const { getByPlaceholderText } = render(Search);
    const input = getByPlaceholderText("Search a name or address...");
    await fireEvent.input(input, { target: { value: "cloudhead" } });
    await screen.findByDisplayValue("cloudhead");
  });
});
