/* eslint-disable no-undef */
const URL = '127.0.0.1:8080';

function getRandomDate() {
  const startYear = 2000;
  const currentYear = new Date().getFullYear();
  const randomYear = Math.floor(Math.random() * (currentYear - startYear + 1)) + startYear;
  const randomMonth = Math.floor(Math.random() * 12) + 1;
  const daysInMonth = new Date(randomYear, randomMonth, 0).getDate();
  const randomDay = Math.floor(Math.random() * daysInMonth) + 1;
  const monthString = randomMonth.toString().padStart(2, '0');
  const dayString = randomDay.toString().padStart(2, '0');
  const dateString = `${randomYear}-${monthString}-${dayString}`;
  return dateString;
}

const randomDate = getRandomDate();

context('Exchange Rates', () => {
  before(() => {
    cy.visit(URL);
    cy.reload(true);
  });

  describe('Uses the exchange rate', () => {
    it('Asserts the currency field only accepts valid currencies', () => {
      cy.get('#base-currency').click().then(($input) => {
        cy.wrap($input).type('test-1/.,+?¿EUR');
        cy.get('#confirm').click().then(() => {
          cy.get('#errors').should('be.visible');
        });
      });
    });

    it('Asserts the amount field only accepts numbers', () => {
      cy.visit(URL);
      cy.get('#user-amount').click().then(($input) => {
        cy.wrap($input).type('test1');
        cy.get('#base-currency').type('USD');
        cy.get('#confirm').click().then(() => {
          cy.get('#errors').should('be.visible');
        });
      });
    });

    it('Asserts that errors are hidden after a correct input', () => {
      cy.visit(URL);
      cy.get('#base-currency').type('banana');
      cy.get('#user-amount').type('lalalala');
      cy.get('#confirm').click().then(() => {
        cy.get('#base-currency').clear();
        cy.get('#base-currency').type('USD');
        cy.get('#user-amount').clear();
        cy.get('#confirm').click().then(() => {
          cy.get('#errors').should('not.be.visible');
        });
      });
    });

    it('Asserts reset button works', () => {
      cy.visit(URL);
      cy.get('#base-currency').type('banana');
      cy.get('#user-amount').type('lalalala');
      cy.get('#confirm').click().then(() => {
        cy.get('#base-currency').clear();
        cy.get('#base-currency').type('USD');
        cy.get('#user-amount').clear();
        cy.get('#user-amount').type('20');
        cy.get('#confirm').click();
        cy.get('#reset').click().then(() => {
          cy.get('#results').should('not.be.visible');
          cy.get('#base-currency').should('be.empty');
          cy.get('#user-amount').should('be.empty');
        });
      });
    });

    it('Asserts the checkbox works', () => {
      cy.visit(URL);
      cy.get('#latest-rates').check().then(() => {
        cy.get('#user-date').should('be.disabled');
      });
    });

    it('Asserts the exchange works with a random date from the selection', () => {
      cy.visit(URL);
      cy.get('#user-date').type(randomDate);
      cy.get('#base-currency').type('USD');
      cy.get('#confirm').click().then(() => {
        cy.get('#results').should('be.visible');
      });
    });
  });
});
