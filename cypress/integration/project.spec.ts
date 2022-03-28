/* eslint-disable @typescript-eslint/no-unused-vars */
/// <reference types="cypress" />
import { MockExtensionProvider } from "../support";

describe("Project View", () => {
  before(() => {
    cy.intercept("https://willow.radicle.garden:8777/", { fixture: "projectHome.json" });
    cy.intercept("https://willow.radicle.garden:8777/v1/peer", { fixture: "projectPeer.json" });
    cy.intercept("https://willow.radicle.garden:8777/v1/projects/bright-forest-protocol", { fixture: "projectInfo.json" });
    cy.intercept("https://willow.radicle.garden:8777/v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy", { fixture: "projectInfo.json" });
    cy.intercept("https://willow.radicle.garden:8777/v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/remotes", { fixture: "projectRemotes.json" });
    cy.intercept("https://willow.radicle.garden:8777/v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/tree/56e4e029c294b08546386e1fb706b772c7433c49", { fixture: "projectTree56e4e02.json" });
    cy.intercept("https://willow.radicle.garden:8777/v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/tree/cbf5df499ab4f4a908f1756fbe2c236a4530516a", { fixture: "projectTreecbf5df4.json" });
    cy.intercept("https://willow.radicle.garden:8777/v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/remotes/hyndc7nx9keq76p1bkw9831arcndeeu3trwsc7kxt3osmpi6j9oeke", { fixture: "projectBranches.json" });
    cy.intercept("https://willow.radicle.garden:8777/v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/readme/56e4e029c294b08546386e1fb706b772c7433c49", { fixture: "projectReadme.json" });
    cy.intercept("https://willow.radicle.garden:8777/v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/commits?parent=cbf5df499ab4f4a908f1756fbe2c236a4530516a", { fixture: "projectCommits.json" });
    cy.intercept("https://willow.radicle.garden:8777/v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/readme/cbf5df499ab4f4a908f1756fbe2c236a4530516a", { fixture: "projectReadme.json" });
    cy.intercept("https://willow.radicle.garden:8777/v1/projects/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/commits/cbf5df499ab4f4a908f1756fbe2c236a4530516a", { fixture: "projectCommit.json" });
  });

  it("Load project view and use peer and branch selector ", () => {
    cy.visit("/seeds/willow.radicle.garden/bright-forest-protocol", {
      onBeforeLoad(win) {
        win.ethereum = new MockExtensionProvider();
      },
    });

    cy.log("Check that the project view is loaded and populated with the stubbed data");
    cy.log("Page Header");
    cy.get("div.title").contains("bright-forest-protocol");
    cy.get("div.urn").contains("rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy");
    cy.get("div.description").contains("bfc-sc");

    cy.log("README");
    cy.get("div.column-right article div.markdown h1").should("have.text", "Basic Sample Hardhat Project");

    cy.log("Project Header");
    cy.get("div.stat.seed span").should("have.text", "willow.radicle.garden");
    cy.get("div.stat.commit-count").should("have.text", "3 commit(s)");
    cy.get("div.stat.contributor-count").should("have.text", "1 contributor(s)");
    cy.get("div.anchor span.anchor-label").contains("not anchored 🔓");
    cy.get("div.stat.branch").should("have.class", "not-allowed").should("have.text", "main");
    cy.get("div.hash.desktop").should("have.text", "56e4e02");

    cy.get("div.clone").click();

    cy.log("Peer Selection");
    cy.get("div.selector").click();
    cy.get("div.dropdown-item").contains("dabit3 hyndc7nx9keq76p1bkw9831arcndeeu3trwsc7kxt3osmpi6j9oeke delegate").click();
    cy.location().should((location) => {
      expect(location.pathname).to.eq('/seeds/willow.radicle.garden/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/remotes/hyndc7nx9keq76p1bkw9831arcndeeu3trwsc7kxt3osmpi6j9oeke/tree');
    });
    cy.get("span.peer-id span[title='hyndc7nx9keq76p1bkw9831arcndeeu3trwsc7kxt3osmpi6j9oeke']").should("have.text", "hyndc7…j9oeke");
    cy.get("div.stat.peer span.peer-id").should("have.text", "dabit3");
    cy.get("div.stat.peer span.badge").should("have.text", "delegate");

    cy.log("Branch Selection");
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

    cy.log("Commit history view");
    cy.get("div.stat.commit-count")
      .should("not.have.class", "active")
      .click();
    cy.location().should((location) => {
      expect(location.pathname).to.eq('/seeds/willow.radicle.garden/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/remotes/hyndc7nx9keq76p1bkw9831arcndeeu3trwsc7kxt3osmpi6j9oeke/history/master');
    });
    cy.get("div.stat.commit-count").should("have.class", "active");

    cy.log("Commit Group & Commit Trailer");
    cy.fixture("groupedCommits.json").then((commitGroup) => {
      // This iterates over the commit groups and then over each commit.
      cy.get("div.commit-group").should("have.length", 2)
        .each((item, index) => {
          expect(Cypress.$(item.children(".commit-date")).text()).to.eq(commitGroup[index].groupDate);
          const $el = Cypress.$(item.find(".commit"));
          cy.wrap($el).each((commit, commitIndex) => {
            expect(Cypress.$(commit).find(".hash").text()).to.eq(commitGroup[index].commits[commitIndex].sha);
            expect(Cypress.$(commit).find("span.summary").text()).to.eq(commitGroup[index].commits[commitIndex].summary);
            expect(Cypress.$(commit).find(".author").text()).to.eq(commitGroup[index].commits[commitIndex].committer.name);
            expect(Cypress.$(commit).find(".time").text()).to.eq(commitGroup[index].commits[commitIndex].committerTime);
          });
        });

      // Checking that the initial commit has the Verified badge
      cy.get(".badge").last().should("have.text", "Verified");
      cy.get("div.summary").last().click();

      cy.log("Commit Detail View");
      // We get the initial commit from the fixture file to assert here
      const { committer, committerTime, summary, description } = commitGroup[1].commits[1];

      cy.location().should((location) => {
        expect(location.pathname).to.eq('/seeds/willow.radicle.garden/rad:git:hnrk8mbpirp7ua7sy66o4t9soasbq4y8uwgoy/remotes/hyndc7nx9keq76p1bkw9831arcndeeu3trwsc7kxt3osmpi6j9oeke/commits/cbf5df499ab4f4a908f1756fbe2c236a4530516a');
      });
      cy.get("header div.summary h3").should("have.text", summary);
      cy.get("header pre.description").should("have.text", description);
      cy.get("header div.meta")
        .first()
        .should("have.text", `Committed by ${committer.name} <${committer.mail}> ${committerTime}`)
        .next()
        .should("have.text", `Authored by ${committer.name} <${committer.mail}>`);
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
});
