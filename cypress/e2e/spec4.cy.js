describe('template spec', () => {
  beforeEach(() => {
    cy.visit('https://example.cypress.io')
  })

  it('C1 - test first', () => {
    cy.get('non existing element')
  })

  it('C2 - test second', () => {
    cy.get('')
  })

  it('C5 - ttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt, this title is sooooo loooong.', () => {
    cy.request('https://reqres.in/api/users?page=2').then(response => {
      cy.log(response)
    })
  })

  it('C6 text', () => {
    cy.get('h1').should('exist').and('be.visible')
  })

  it('C7text', () => {
    cy.get('h1').should('exist').and('be.visible')
  })

  it('C8text', () => {
    cy.get('h1').should('exist').and('be.visible')
  })
 
  describe('test', () => {
    it('C11', () => {
      cy.get('0').should('exist').and('be.visible')
    })
  
    it('C12', () => {
      cy.get('0').should('exist').and('be.visible')
    })
  })
})
