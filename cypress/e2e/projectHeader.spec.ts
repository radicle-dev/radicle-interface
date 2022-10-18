/* eslint-disable @typescript-eslint/no-unused-vars */
/// <reference types="cypress" />
import { MockProvider } from "@rsksmart/mock-web3-provider";

describe("project header", () => {
  beforeEach(() => {
    cy.intercept("/", {
      fixture: "projectHome.json",
    }).as("projectHome");
    cy.intercept("v1/peer", {
      fixture: "projectPeer.json",
    }).as("projectPeer");
    cy.intercept("v1/projects/bright-forest-protocol", {
      fixture: "projectInfo.json",
    }).as("projectInfo");
    cy.intercept("v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy", {
      fixture: "projectInfo.json",
    }).as("projectInfo");
    cy.intercept(
      "v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/remotes",
      { fixture: "projectRemotes.json" },
    ).as("projectRemotes");
    cy.intercept(
      "v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/issues",
      { fixture: "projectIssues.json" },
    ).as("projectIssues");
    cy.intercept(
      "v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/patches",
      { fixture: "projectPatches.json" },
    ).as("projectPatches");
    cy.intercept(
      "v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/tree/56e4e029c294b08546386e1fb706b772c7433c49",
      { fixture: "projectTree56e4e02.json" },
    ).as("projectTree56e4e02");
    cy.intercept(
      "v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/tree/cbf5df499ab4f4a908f1756fbe2c236a4530516a",
      { fixture: "projectTreecbf5df4.json" },
    ).as("projectTreecbf5df4");
    cy.intercept(
      "v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/remotes/hyndc7nx9keq76p1bkw9831arcndeeu3trwsc7kxt3osmpi6j9oeke",
      { fixture: "projectBranches.json" },
    ).as("projectBranches");
    cy.intercept(
      "v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/readme/56e4e029c294b08546386e1fb706b772c7433c49",
      { fixture: "projectReadme.json" },
    ).as("projectReadme56e4e02");
    cy.intercept(
      "v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/commits?parent=cbf5df499ab4f4a908f1756fbe2c236a4530516a?verified=true",
      { fixture: "projectCommits.json" },
    ).as("projectCommitscbf5df4");
    cy.intercept(
      "v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/commits?parent=56e4e029c294b08546386e1fb706b772c7433c49?verified=true",
      { fixture: "projectCommits.json" },
    ).as("projectCommits56e4e02");
    cy.intercept(
      "v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/readme/cbf5df499ab4f4a908f1756fbe2c236a4530516a",
      { fixture: "projectReadme.json" },
    ).as("projectReadmecbf5df4");
    cy.intercept(
      "v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/commits/cbf5df499ab4f4a908f1756fbe2c236a4530516a",
      { fixture: "projectCommit.json" },
    ).as("projectCommitcbf5df4");
  });
  it("renders header correctly", () => {
    cy.visit("/seeds/willow.radicle.garden/bright-forest-protocol", {
      onBeforeLoad(win) {
        const address = "0xB98bD7C7f656290071E52D1aA617D9cB4467Fd6D";
        const privateKey =
          "de926db3012af759b4f24b5a51ef6afa397f04670f634aa4f48d4480417007f3";
        win.ethereum = new MockProvider({
          address,
          privateKey,
          networkVersion: 1,
        });
      },
    });
    cy.wait([
      "@projectHome",
      "@projectPeer",
      "@projectInfo",
      "@projectRemotes",
      "@projectTree56e4e02",
      "@projectReadme56e4e02",
    ]);
    cy.get("div.stat.seed span").should("have.text", "willow.radicle.garden");
    cy.get("div.stat.commit-count").should("have.text", "3\n    commit(s)");
    cy.get("div.stat.contributor-count").should(
      "have.text",
      "1\n    contributor(s)",
    );
    cy.get("div.stat.branch")
      .should("have.class", "not-allowed")
      .should("have.text", "main");
    cy.get("div.hash.desktop").should("have.text", "56e4e02");
    cy.get("div.clone-button").click();
  });

  it("lets user change peer", () => {
    cy.get("div.selector").click();
    cy.get("div.dropdown-item")
      .contains(
        "dabit3 hyndc7nx9keq76p1bkw9831arcndeeu3trwsc7kxt3osmpi6j9oeke delegate",
      )
      .click();
    cy.wait([
      "@projectHome",
      "@projectPeer",
      "@projectInfo",
      "@projectRemotes",
      "@projectBranches",
      "@projectTree56e4e02",
      "@projectReadme56e4e02",
    ]);
    cy.location().should(location => {
      expect(location.pathname).to.eq(
        "/seeds/willow.radicle.garden/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/remotes/hyndc7nx9keq76p1bkw9831arcndeeu3trwsc7kxt3osmpi6j9oeke/tree",
      );
    });
    cy.get(
      "span.peer-id span[title='hyndc7nx9keq76p1bkw9831arcndeeu3trwsc7kxt3osmpi6j9oeke']",
    ).should("have.text", "hyndc7…j9oeke");
    cy.get("div.stat.peer span.peer-id").should("have.text", "dabit3");
    cy.get("div.stat.peer span.badge").should("have.text", "delegate");
  });

  it("lets user on a specific peer change branches", () => {
    cy.get("div.commit div.stat.branch").click();
    cy.get("div.dropdown-item")
      .first()
      .contains("main")
      .next()
      .contains("master")
      .click();
    cy.wait(["@projectTree56e4e02", "@projectReadme56e4e02"]);
    cy.location().should(location => {
      expect(location.pathname).to.eq(
        "/seeds/willow.radicle.garden/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/remotes/hyndc7nx9keq76p1bkw9831arcndeeu3trwsc7kxt3osmpi6j9oeke/tree",
      );
    });
    cy.get("div.stat.branch").should("have.text", "master");
    cy.get("div.hash.desktop").should("have.text", "cbf5df4");
  });

  it("navigate to commit history", () => {
    cy.get("div.stat.commit-count").should("not.have.class", "active").click();
    cy.wait(["@projectTree56e4e02", "@projectCommits56e4e02"]);
    cy.location().should(location => {
      expect(location.pathname).to.eq(
        "/seeds/willow.radicle.garden/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/remotes/hyndc7nx9keq76p1bkw9831arcndeeu3trwsc7kxt3osmpi6j9oeke/history",
      );
    });
    cy.get("div.stat.commit-count").should("have.class", "active");
  });

  it("navigate to issues listing", () => {
    cy.get("div.stat.issue-count").click();
    cy.wait(["@projectTree56e4e02", "@projectIssues"]);
    cy.location().should(location => {
      expect(location.pathname).to.eq(
        "/seeds/willow.radicle.garden/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/remotes/hyndc7nx9keq76p1bkw9831arcndeeu3trwsc7kxt3osmpi6j9oeke/issues",
      );
    });
    cy.get("div.stat.issue-count").should("have.class", "active");
  });

  it("navigate to patches listing", () => {
    cy.get("div.stat.patch-count").click();
    cy.wait(["@projectTree56e4e02", "@projectPatches"]);
    cy.location().should(location => {
      expect(location.pathname).to.eq(
        "/seeds/willow.radicle.garden/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/remotes/hyndc7nx9keq76p1bkw9831arcndeeu3trwsc7kxt3osmpi6j9oeke/patches",
      );
    });
    cy.get("div.stat.patch-count").should("have.class", "active");
  });
});
