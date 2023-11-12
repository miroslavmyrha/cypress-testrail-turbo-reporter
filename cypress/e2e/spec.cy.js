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

  it('C3 - test third', () => {
    cy.get('h1').should('exist').and('be.visible')
  })

  it('C4 - test fourth', () => {
    cy.get('nevim')
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

  context('test2', () => {
    it('C9', () => {
      cy.get('h10').should('exist').and('be.visible')
    })
  
    it('C10', () => {
      cy.get('h1').should('exist').and('be.visible')
    })
  })
})
