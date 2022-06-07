/* eslint-disable @typescript-eslint/no-unused-vars */
/// <reference types="cypress" />
import { MockExtensionProvider } from "../support/e2e";

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
            mail: "dabit3@gmail.com"
          },
          committerTime: "06:51 GMT+1"
        }
      }
    ]
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
            mail: "dabit3@gmail.com"
          },
          committerTime: "17:14 GMT+1"
        }
      },
      {
        header: {
          sha: "cbf5df4",
          summary: "initial commit",
          description: "this is the first commit of many",
          committer: {
            name: "dabit3",
            mail: "dabit3@gmail.com"
          },
          committerTime: "16:58 GMT+1"
        }
      }
    ]
  }
];

describe("Project view", () => {
  beforeEach(() => {
    cy.intercept("https://willow.radicle.garden:8777/", { fixture: "projectHome.json" });
    cy.intercept("https://willow.radicle.garden:8777/v1/peer", { fixture: "projectPeer.json" });
    cy.intercept("https://willow.radicle.garden:8777/v1/projects/bright-forest-protocol", { fixture: "projectInfo.json" });
    cy.intercept("https://willow.radicle.garden:8777/v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy", { fixture: "projectInfo.json" });
    cy.intercept("https://willow.radicle.garden:8777/v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/remotes", { fixture: "projectRemotes.json" });
    cy.intercept("https://willow.radicle.garden:8777/v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/issues", { fixture: "projectIssues.json" });
    cy.intercept("https://willow.radicle.garden:8777/v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/tree/56e4e029c294b08546386e1fb706b772c7433c49", { fixture: "projectTree56e4e02.json" });
    cy.intercept("https://willow.radicle.garden:8777/v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/tree/cbf5df499ab4f4a908f1756fbe2c236a4530516a", { fixture: "projectTreecbf5df4.json" });
    cy.intercept("https://willow.radicle.garden:8777/v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/remotes/hyndc7nx9keq76p1bkw9831arcndeeu3trwsc7kxt3osmpi6j9oeke", { fixture: "projectBranches.json" });
    cy.intercept("https://willow.radicle.garden:8777/v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/readme/56e4e029c294b08546386e1fb706b772c7433c49", { fixture: "projectReadme.json" });
    cy.intercept("https://willow.radicle.garden:8777/v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/commits?parent=cbf5df499ab4f4a908f1756fbe2c236a4530516a?verified=true", { fixture: "projectCommits.json" });
    cy.intercept("https://willow.radicle.garden:8777/v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/readme/cbf5df499ab4f4a908f1756fbe2c236a4530516a", { fixture: "projectReadme.json" });
    cy.intercept("https://willow.radicle.garden:8777/v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/commits/cbf5df499ab4f4a908f1756fbe2c236a4530516a", { fixture: "projectCommit.json" });
  });

  it("Page header", () => {
    cy.visit("/seeds/willow.radicle.garden/bright-forest-protocol", {
      onBeforeLoad(win) {
        win.ethereum = new MockExtensionProvider("homestead", "0x3256a804085C24f3451cAb2C98a37e16DEEc5721");
      },
    });
    cy.get("div.title").contains("bright-forest-protocol");
    cy.get("div.urn").contains("rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy");
    cy.get("div.description").contains("bfc-sc");
  });

  it("Browser", () => {
    cy.get("div.column-right article div.markdown h1").should("have.text", "Basic Sample Hardhat Project");
  });

  it("Project Header", () => {
    cy.get("div.stat.seed span").should("have.text", "willow.radicle.garden");
    cy.get("div.stat.commit-count").should("have.text", "3 commit(s)");
    cy.get("div.stat.contributor-count").should("have.text", "1 contributor(s)");
    cy.get("div.anchor span.anchor-label").contains("not anchored 🔓");
    cy.get("div.stat.branch").should("have.class", "not-allowed").should("have.text", "main");
    cy.get("div.hash.desktop").should("have.text", "56e4e02");
    cy.get("div.clone").click();
  });

  it("Peer selector", () => {
    cy.get("div.selector").click();
    cy.get("div.dropdown-item").contains("dabit3 hyndc7nx9keq76p1bkw9831arcndeeu3trwsc7kxt3osmpi6j9oeke delegate").click();
    cy.location().should((location) => {
      expect(location.pathname).to.eq('/seeds/willow.radicle.garden/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/remotes/hyndc7nx9keq76p1bkw9831arcndeeu3trwsc7kxt3osmpi6j9oeke/tree');
    });
    cy.get("span.peer-id span[title='hyndc7nx9keq76p1bkw9831arcndeeu3trwsc7kxt3osmpi6j9oeke']").should("have.text", "hyndc7…j9oeke");
    cy.get("div.stat.peer span.peer-id").should("have.text", "dabit3");
    cy.get("div.stat.peer span.badge").should("have.text", "delegate");
  });

  it("Branch selector", () => {
    cy.get("div.commit div.stat.branch").click();
    cy.get("div.dropdown-item")
      .first()
      .contains("main")
      .next()
      .contains("master")
      .click();
    cy.location().should((location) => {
      expect(location.pathname).to.eq('/seeds/willow.radicle.garden/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/remotes/hyndc7nx9keq76p1bkw9831arcndeeu3trwsc7kxt3osmpi6j9oeke/tree/master');
    });
    cy.get("div.stat.branch").should("have.text", "master");
    cy.get("div.hash.desktop").should("have.text", "cbf5df4");
  });

  it("Commits button", () => {
    cy.get("div.stat.commit-count")
      .should("not.have.class", "active")
      .click();
    cy.location().should((location) => {
      expect(location.pathname).to.eq('/seeds/willow.radicle.garden/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/remotes/hyndc7nx9keq76p1bkw9831arcndeeu3trwsc7kxt3osmpi6j9oeke/history/master');
    });
    cy.get("div.stat.commit-count").should("have.class", "active");
  });

  it("Commit group & commit trailer", () => {
    // This iterates over the commit groups and then over each commit.
    cy.get(".commit-group").should("have.length", 2)
      .each((item, index) => {
        expect(Cypress.$(item.children(".commit-date")).text()).to.eq(groupedCommits[index].groupDate);
        const $el = Cypress.$(item.find(".commit-teaser"));
        cy.wrap($el).each((commit, commitIndex) => {
          expect(Cypress.$(commit).find(".hash").text()).to.eq(groupedCommits[index].commits[commitIndex].header.sha);
          expect(Cypress.$(commit).find(".summary").text()).to.eq(groupedCommits[index].commits[commitIndex].header.summary);
          expect(Cypress.$(commit).find(".committer").text()).to.eq(groupedCommits[index].commits[commitIndex].header.committer.name);
        });
      });

    // Checking that the initial commit has the Verified badge
    cy.get(".badge").last().should("have.text", "Verified");
    cy.get(".commit").last().click();
  });

  it("Commit detail view", () => {
    cy.location().should((location) => {
      expect(location.pathname).to.eq('/seeds/willow.radicle.garden/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/remotes/hyndc7nx9keq76p1bkw9831arcndeeu3trwsc7kxt3osmpi6j9oeke/commits/cbf5df499ab4f4a908f1756fbe2c236a4530516a');
    });
    cy.get("header .summary .text-medium").should("have.text", "initial commit");
    cy.get("header pre.description").should("have.text", "this is the first commit of many");
    cy.get("header .committer").should("have.text", "dabit3");
    cy.get("div.changeset-summary").should("have.text", "1 file(s) changed\n    with\n    0 addition(s)\n    and\n    0 deletion(s)");
    cy.get("header.file-header:nth-child(1) div.file-data > *")
      .first()
      .should("have.text", "README.md")
      .next()
      .should("have.text", "created");
    cy.get("tr.diff-line td.diff-line-number").contains("16");
    cy.get("tr.diff-line td.diff-line-content").contains("To prevent front-running, the RAD/USDC balances are set through the Uniswap router *proxy* contract");
  });
});
