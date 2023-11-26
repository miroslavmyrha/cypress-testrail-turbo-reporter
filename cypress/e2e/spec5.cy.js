describe('test2', () => {
  beforeEach(() => {
    cy.visit('https://example.cypress.io')
  })

  it('C3 - test third', () => {
    cy.get('h1').should('exist').and('be.visible')
  })

  it.skip('C4 - test fourth', () => {
    cy.get('nevim')
  })
})