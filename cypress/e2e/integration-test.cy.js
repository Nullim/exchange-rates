const URL = '127.0.0.1:8080';

context('Exchange Rates', () => {
  before(() => {
    cy.visit(URL);
  });

  describe('Uses the exchange rate', () => {
    it('Makes sure the currency field only accepts valid currencies', () => {
      cy.get('#base-currency').click().then(($input) => {
        cy.wrap($input).type('test-1/.,+?¿');
        cy.get('#confirm').click().then(() => {
          cy.get('#errors').should('be.visible');
        });
      });
    });
  });
});
