import BranchSelector from "./BranchSelector.svelte";
import { mount } from "radicle-svelte-unit-test";
import { styles } from "@test/support/index";

const defaultProps = {
  info: {
    head: "e678629cd37c770c640a2cd997fc76303c815772",
    urn: "rad:git:hnrkqdpm9ub19oc8dccx44echy76hzfsezyio",
    name: "nakamoto",
    description: "Privacy-preserving Bitcoin light-client implementation in Rust",
    defaultBranch: "master",
    maintainers: [
      "rad:git:hnrkqdpm9ub19oc8dccx44echy76hzfsezyio"
    ],
    delegates: [
      "hyn9diwfnytahjq8u3iw63h9jte1ydcatxax3saymwdxqu1zo645pe"
    ]
  },
  branches: { "master": "e678629cd37c770c640a2cd997fc76303c815772" },
  revision: "e678629cd37c770c640a2cd997fc76303c815772",
};

describe('BranchSelector', function () {
  it("Render with commit = head and branch listing", () => {
    mount(BranchSelector, {
      props: defaultProps
    }, styles);
    cy.findByText("master").should("exist");
    cy.get("div.commit > div.hash.desktop").should("have.text", "e678629");
  });

  it("Test Branch selection", () => {
    // The viewport here is to simulate desktop behaviour
    cy.viewport(800, 300);
    mount(BranchSelector, {
      props: {
        ...defaultProps, branches: {
          "master": "e678629cd37c770c640a2cd997fc76303c815772",
          "feature-branch": "29e8b7b0f3019b8e8a6d9bfb0964ee78f4ff12f5",
          "xyz": "debf82ef3623ec11751a993bda85bac2ff1c6f00",
        },
        branchesDropdown: true,
      }, callbacks: {
        branchChanged: cy.stub().as("branchChanged")
      }
    }, styles);
    cy.get("div.dropdown > div").first().click();
    cy.get("@branchChanged")
      .should("be.calledOnce")
      .its("firstCall.args.0.detail")
      .should("equal", "feature-branch");
  });

  it("Render with commit != head, passing a branch as rev and branch listing", () => {
    mount(BranchSelector, {
      props: {
        ...defaultProps, branches: {
          "master": "e678629cd37c770c640a2cd997fc76303c815772",
          "feature-branch": "29e8b7b0f3019b8e8a6d9bfb0964ee78f4ff12f5",
          "xyz": "debf82ef3623ec11751a993bda85bac2ff1c6f00",
        },
        revision: "feature-branch"
      }
    }, styles);
    cy.findByText("feature-branch").should("exist");
    cy.get("div.commit > div.hash.desktop").should("have.text", "29e8b7b");
  });

  it("Render with commit != head passing a commit as rev and branch listing", () => {
    mount(BranchSelector, {
      props: {
        ...defaultProps,
        revision: "debf82ef3623ec11751a993bda85bac2ff1c6f00"
      }
    }, styles
    );
    cy.get("div.commit > div.hash.desktop").should("have.text", "debf82ef3623ec11751a993bda85bac2ff1c6f00");
  });

  it("Render with commit = head, without branch listing", () => {
    mount(BranchSelector, {
      props: {
        ...defaultProps,
        revision: "e678629cd37c770c640a2cd997fc76303c815772",
        branches: {},
      }
    }, styles
    );
    cy.get("div.commit > div.hash.desktop").should("have.text", "e678629cd37c770c640a2cd997fc76303c815772");
  });

  it("Render without branch listing, commit != head", () => {
    mount(BranchSelector, {
      props: {
        ...defaultProps,
        revision: "6b84e519d3c535879eb2b9ee8457bb70ca275a75",
        branches: {},
      }
    }, styles);
    cy.get("div.commit > div.hash.desktop").should("have.text", "6b84e519d3c535879eb2b9ee8457bb70ca275a75");
  });
});
