context('test2', () => {
  beforeEach(() => {
    cy.visit('https://example.cypress.io')
  })

  it('C9', () => {
    cy.get('h10').should('exist').and('be.visible')
  })

  it.skip('C10', () => {
    cy.get('h1').should('exist').and('be.visible')
  })
})