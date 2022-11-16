import { mount } from "cypress/svelte";
import { Buffer } from "buffer";

window.Buffer = Buffer;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}

Cypress.Commands.add("mount", mount);
