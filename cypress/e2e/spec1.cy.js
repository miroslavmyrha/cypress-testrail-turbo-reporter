context('something', () => {
  beforeEach(() => {
    cy.visit('https://example.cypress.io')
  })

  it('C419 textt', () => {
    cy.get('h10').should('exist').and('be.visible')
  })

  it('C465 textt', () => {
    cy.get('h10').should('exist').and('be.visible')
  })

})