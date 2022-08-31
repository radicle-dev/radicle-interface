import BranchSelector from "./BranchSelector.svelte";
import { fireEvent, render } from "@testing-library/svelte";
import "@public/index.css";

const defaultProps = {
  project: {
    head: "e678629cd37c770c640a2cd997fc76303c815772",
    urn: "rad:git:hnrkqdpm9ub19oc8dccx44echy76hzfsezyio",
    name: "nakamoto",
    description:
      "Privacy-preserving Bitcoin light-client implementation in Rust",
    defaultBranch: "master",
    maintainers: ["rad:git:hnrkqdpm9ub19oc8dccx44echy76hzfsezyio"],
    delegates: ["hyn9diwfnytahjq8u3iw63h9jte1ydcatxax3saymwdxqu1zo645pe"],
  },
  branches: { master: "e678629cd37c770c640a2cd997fc76303c815772" },
  revision: "e678629cd37c770c640a2cd997fc76303c815772",
};

describe("Logic", () => {
  it("should show defaultBranch label and head commit if revision === head", () => {
    const { rerender } = render(BranchSelector, {
      props: defaultProps,
    });
    cy.get("div.stat.branch")
      .should("be.visible")
      .should("have.text", "master");
    cy.get("div.hash.mobile")
      .should("be.visible")
      .should("have.text", "e678629");

    // If project.head is null we should get the head from branches.
    rerender({
      props: {
        ...defaultProps,
        project: {
          head: null,
          urn: "rad:git:hnrkqdpm9ub19oc8dccx44echy76hzfsezyio",
          name: "nakamoto",
          description:
            "Privacy-preserving Bitcoin light-client implementation in Rust",
          defaultBranch: "master",
          maintainers: ["rad:git:hnrkqdpm9ub19oc8dccx44echy76hzfsezyio"],
          delegates: ["hyn9diwfnytahjq8u3iw63h9jte1ydcatxax3saymwdxqu1zo645pe"],
        },
      },
    });
    cy.get("div.stat.branch")
      .should("be.visible")
      .should("have.text", "master");
    cy.get("div.hash.mobile")
      .should("be.visible")
      .should("have.text", "e678629");
  });

  it("should show the branch dropdown if branches available", () => {
    render(BranchSelector, {
      props: {
        ...defaultProps,
        branches: {
          master: "e678629cd37c770c640a2cd997fc76303c815772",
          "feature-branch": "29e8b7b0f3019b8e8a6d9bfb0964ee78f4ff12f5",
          xyz: "debf82ef3623ec11751a993bda85bac2ff1c6f00",
        },
      },
    });
    cy.get("div.commit div.stat.branch").click();
    cy.get("div.dropdown div.dropdown-item")
      .first()
      .should("contain.text", "feature-branch")
      .next()
      .should("contain.text", "master")
      .should("have.class", "selected")
      .next()
      .should("contain.text", "xyz");
  });

  it("should show feature-branch label and head commit, if branch label is passed as revision", () => {
    render(BranchSelector, {
      props: {
        ...defaultProps,
        branches: {
          master: "e678629cd37c770c640a2cd997fc76303c815772",
          "feature-branch": "29e8b7b0f3019b8e8a6d9bfb0964ee78f4ff12f5",
          xyz: "debf82ef3623ec11751a993bda85bac2ff1c6f00",
        },
        revision: "feature-branch",
      },
    });
    cy.get("div.stat.branch")
      .should("be.visible")
      .should("have.text", "feature-branch");
    cy.get("div.hash.mobile")
      .should("be.visible")
      .should("have.text", "29e8b7b");
  });

  it("should show only commit if no branchLabel nor branches are available", () => {
    render(BranchSelector, {
      props: {
        ...defaultProps,
        revision: "debf82ef3623ec11751a993bda85bac2ff1c6f00",
        branches: {},
      },
    });
    cy.get("div.hash.mobile")
      .should("be.visible")
      .should("have.text", "debf82e");
    cy.viewport("macbook-13");
    cy.get("div.hash.desktop")
      .should("be.visible")
      .should("have.text", "debf82ef3623ec11751a993bda85bac2ff1c6f00");
  });

  it("should show only commit if branches are available but no branchLabel", () => {
    render(BranchSelector, {
      props: {
        ...defaultProps,
        revision: "debf82ef3623ec11751a993bda85bac2ff1c6f00",
      },
    });
    cy.get("div.hash.mobile")
      .should("be.visible")
      .should("have.text", "debf82e");
    cy.viewport("macbook-13");
    cy.get("div.hash.desktop")
      .should("be.visible")
      .should("have.text", "debf82ef3623ec11751a993bda85bac2ff1c6f00");
  });

  it("should show defaultBranch label if revision === head", () => {
    render(BranchSelector, {
      props: {
        ...defaultProps,
        revision: "e678629cd37c770c640a2cd997fc76303c815772",
        branches: {},
      },
    });
    cy.get("div.stat.branch.not-allowed")
      .should("be.visible")
      .should("have.text", "master");
  });
});

describe("Layout", () => {
  it("should show shortened commit when on mobile, and full hash when on desktop", () => {
    render(BranchSelector, {
      props: {
        ...defaultProps,
        revision: "e678629cd37c770c640a2cd997fc76303c815772",
      },
    });
    cy.viewport("iphone-x");
    cy.get("div.hash.mobile").should("be.visible");
    cy.get("div.hash.desktop").should("not.be.visible");
    cy.viewport("macbook-15");
    cy.get("div.hash.mobile").should("not.be.visible");
    cy.get("div.hash.desktop").should("be.visible");
  });
});

describe("Events", () => {
  it("should dispatch a 'branchChanged' event on click", () => {
    const { getByText, component } = render(BranchSelector, {
      props: {
        ...defaultProps,
        revision: "feature-branch",
        branches: {
          "feature-branch": "29e8b7b0f3019b8e8a6d9bfb0964ee78f4ff12f5",
          xyz: "debf82ef3623ec11751a993bda85bac2ff1c6f00",
        },
      },
    });

    cy.get("div.commit div.stat.branch")
      .click()
      .then(() => {
        const branchLabel = getByText("xyz");

        const mock = cy.spy();
        component.$on("branchChanged", mock);

        fireEvent.click(branchLabel);
        expect(mock).to.have.been.calledOnce;
      });
  });
});
