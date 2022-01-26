import Error from "./Error.svelte";
import { mount } from "cypress-svelte-unit-test";
import * as commands from "@test/support/commands";
import { Failure } from '@app/error';

describe('Error', function () {
  it("Open Error modal with default props", () => {
    mount(Error, { props: {
      subtitle: "Subtitle of Modal",
      error: {
        type: Failure.InsufficientBalance,
        txHash: "0x8b678e51f970c5307bf45a8bcea373b597f9acbcea5c5ba784a1d383361a89d1",
        message: "Not enough RAD"
      }
    } });
    commands.pick("title").should("contain", "Error");
    commands.pick("subtitle").should("contain", "Subtitle of Modal");
    commands.pick("body").should("contain", "Error: Not enough RAD");
    commands.pick("action-btn").should("contain", "Back");
  });
  it("Open Error modal with custom message", () => {
    mount(Error, { props: {
      subtitle: "Subtitle of Modal",
      message: "Error message to check for",
    } });
    commands.pick("subtitle").should("contain", "Subtitle of Modal");
    commands.pick("body").should("contain", "Error: Error message to check for");
    commands.pick("action-btn").should("contain", "Back");
  });
  it("Check floating modal changes button label to Close", () => {
    mount(Error, { props: {
      title: "Title of Modal",
      subtitle: "Subtitle of Modal",
      message: "Error message to check for",
      floating: true
    } });
    commands.pick("action-btn").should("contain", "Close");
  });
});
