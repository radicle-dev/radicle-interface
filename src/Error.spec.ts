import Error from "./Error.svelte";
import { Failure } from '@app/error';
import { render, screen } from "@testing-library/svelte";
import { describe, test } from "vitest";

describe('Error', function () {
  test("Open Error modal with default props", () => {
    render(Error, { props: {
      subtitle: "Subtitle of Modal",
      error: {
        type: Failure.InsufficientBalance,
        txHash: "0x8b678e51f970c5307bf45a8bcea373b597f9acbcea5c5ba784a1d383361a89d1",
        message: "Not enough RAD"
      }
    } });
    screen.findByText("Error");
    screen.findByText("Subtitle of Modal");
    screen.findByText("Error: Not enough RAD");
    screen.findByText("Back");
  });

  test("Open Error modal with custom message", () => {
    render(Error, { props: {
      subtitle: "Subtitle of Modal",
      message: "Error message to check for",
    } });
    screen.findByText("Subtitle of Modal");
    screen.findByText("Error: Error message to check for");
    screen.findByText("Back");
  });

  test("Check floating modal changes button label to Close", () => {
    render(Error, { props: {
      title: "Title of Modal",
      subtitle: "Subtitle of Modal",
      message: "Error message to check for",
      floating: true
    } });
    screen.findByText("Close");
  });
});
