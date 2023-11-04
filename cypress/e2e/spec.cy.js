describe('template spec', () => {
  beforeEach(() => {
    cy.visit('https://example.cypress.io')
  })

  it('C9039 - test 1', () => {
    cy.get('non existing element')
  })

  it('C9099 - test 2', () => {
    cy.get('')
  })

  it('C9988 - test 3', () => {
    cy.get('h1').should('exist').and('be.visible')
  })

  it('C9989 - test 4', () => {
    cy.get('nevim')
  })
})
