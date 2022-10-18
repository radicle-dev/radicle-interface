/* eslint-disable @typescript-eslint/no-unused-vars */
/// <reference types="cypress" />
import { MockProvider } from "@rsksmart/mock-web3-provider";

const groupedCommits = [
  {
    groupDate: "Thursday, March 3, 2022",
    commits: [
      {
        header: {
          sha: "9cd3532",
          summary: "Second commit",
          description: "",
          committer: {
            name: "dabit3",
            mail: "dabit3@gmail.com",
          },
          committerTime: "06:51 GMT+1",
        },
      },
    ],
  },
  {
    groupDate: "Wednesday, March 2, 2022",
    commits: [
      {
        header: {
          sha: "e045b92",
          summary: "Update README",
          description: "",
          committer: {
            name: "dabit3",
            mail: "dabit3@gmail.com",
          },
          committerTime: "17:14 GMT+1",
        },
      },
      {
        header: {
          sha: "cbf5df4",
          summary: "initial commit",
          description: "this is the first commit of many",
          committer: {
            name: "dabit3",
            mail: "dabit3@gmail.com",
          },
          committerTime: "16:58 GMT+1",
        },
      },
    ],
  },
];

describe("project commits", () => {
  before(() => {
    cy.intercept("/", {
      fixture: "projectHome.json",
    }).as("seedHome");
    cy.intercept("v1/peer", {
      fixture: "projectPeer.json",
    }).as("seedPeer");
    cy.intercept("v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy", {
      fixture: "projectInfo.json",
    }).as("seedInfo");
    cy.intercept(
      "v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/remotes",
      { fixture: "projectRemotes.json" },
    ).as("seedRemotes");
    cy.intercept(
      "v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/tree/56e4e029c294b08546386e1fb706b772c7433c49/",
      { fixture: "projectTree56e4e02.json" },
    ).as("seedTree56e4e02");
    cy.intercept(
      "v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/tree/cbf5df499ab4f4a908f1756fbe2c236a4530516a/",
      { fixture: "projectTreecbf5df4.json" },
    ).as("seedTreecbf5df4");
    cy.intercept(
      "v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/commits?parent=56e4e029c294b08546386e1fb706b772c7433c49&verified=true",
      { fixture: "projectCommits.json" },
    ).as("seedCommits");
    cy.intercept(
      "v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/commits/cbf5df499ab4f4a908f1756fbe2c236a4530516a",
      { fixture: "projectCommit.json" },
    ).as("seedCommit");
  });

  it("display commit groups and commit trailers", () => {
    cy.visit(
      "/seeds/willow.radicle.garden/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/history",
      {
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
      },
    );
    cy.wait([
      "@seedHome",
      "@seedPeer",
      "@seedInfo",
      "@seedRemotes",
      "@seedTree56e4e02",
      "@seedCommits",
    ]);
    // This iterates over the commit groups and then over each commit.
    cy.get(".commit-group")
      .should("have.length", 2)
      .each((item, index) => {
        expect(Cypress.$(item.children(".commit-date")).text()).to.eq(
          groupedCommits[index].groupDate,
        );
        const $el = Cypress.$(item.find(".commit-teaser"));
        cy.wrap($el).each((commit, commitIndex) => {
          expect(Cypress.$(commit).find(".hash").text()).to.eq(
            groupedCommits[index].commits[commitIndex].header.sha,
          );
          expect(Cypress.$(commit).find(".summary").text()).to.eq(
            groupedCommits[index].commits[commitIndex].header.summary,
          );
          expect(Cypress.$(commit).find(".committer").first().text()).to.eq(
            groupedCommits[index].commits[commitIndex].header.committer.name,
          );
        });
      });

    cy.get(".commit-teaser .badge").last().trigger("mouseenter");
    // Checking that the initial commit has the Verified badge
    cy.get(".popup .header").should(
      "have.text",
      "✔ This commit was signed\n            with the committer's radicle key.",
    );
    cy.get(".popup .peer").should(
      "contain.text",
      "hyyg555wwkkutaysg6yr67qnu5d5ji54iur3n5uzzszndh8dp7ofue",
    );
    cy.get(".popup .committer").should("contain.text", "dabit3");

    cy.get(".commit").last().click();
  });

  it("display commit details", () => {
    cy.location().should(location => {
      expect(location.pathname).to.eq(
        "/seeds/willow.radicle.garden/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/commits/cbf5df499ab4f4a908f1756fbe2c236a4530516a",
      );
    });
    cy.get("header .summary .txt-medium").should("have.text", "initial commit");
    cy.get(".commit pre.description").should(
      "have.text",
      "this is the first commit of many",
    );
    cy.get("header .committer").should("have.text", "dabit3");
    cy.get("div.changeset-summary").should(
      "have.text",
      "1 file(s) changed, 1 file(s) created, 1 file(s) deleted\n  with\n  0 addition(s)\n  and\n  0 deletion(s)",
    );
    cy.get("header.file-header:nth-child(1) p")
      .first()
      .should("have.text", "test.md")
      .next()
      .should("have.text", "created");
    cy.get("tr.diff-line td.diff-line-number").contains("16");
    cy.get("tr.diff-line td.diff-line-content").contains(
      "To prevent front-running, the RAD/USDC balances are set through the Uniswap router *proxy* contract",
    );
  });
});
