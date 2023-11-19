# cypress-testrail-turbo-reporter
My own testrail reporter.

- The goal of this project is parse data from junit reporter and send results of tests to Tetsrail API via Axios.
- Requirements are only send passed/failed with possible feature extensions in the future.
- All essential magic takes place in node events and with hooks in cypress.config.js file.
- Results are parsed, merged and preprocessed in /results folder
- **notice:** It works well in headless mode, but in interactive mode it should don´t works well due to experimental mode with - **experimentalInteractiveRunEvents**, see: [plugins documentation](https://docs.cypress.io/api/plugins/after-run-api).


## Introduction

- [Cypress](https://www.cypress.io/) is most popular JS/TS test framework for writing automated tests. 
- [Testrail](https://www.testrail.com/) is most popular test management tool with many functions.
- Motivation for make this project are improvement myself in coding in javascript and try to make very first open source project.

## Usage example

- check your project ID and set up it in .env file ... and others configuration in .env setup: [.env setup](https://github.com/miroslavkadidlo/cypress-testrail-turbo-reporter/blob/main/README.md#env-setup)


```bash
# project ID: 
TR_PROJECT_ID = <ID number of your Testrail project>
```

![image](https://github.com/miroslavkadidlo/cypress-testrail-turbo-reporter/assets/16743203/50d5ec78-be3d-42aa-bb99-83582a0bca9d)

- Testcases with Case ID´s are created:

![image](https://github.com/miroslavkadidlo/cypress-testrail-turbo-reporter/assets/16743203/6703a57c-afae-45cb-a79e-7d7529c95cda)

- Valid structures:

```bash
describe('Test suite 1', () => {
  before(() => {
    cy.visit('https://<myTestPage.com>')
  })

  it('C1 - h1 is visible test', () => {
    cy.get('h1').should('be.visible')
  })

  it('C2 - anchor with caption "Ahoj!" test', () => {
    cy.get('a').contains('Ahoj!').should('be.visible')
  })

  it('C3 - Button with caption "GO!" test', () => {
    cy.get('button').contains('GO!').should('be.visible')
  })
})
```

- or nested context/describe

```bash
describe('Test suite 1', () => {
  before(() => {
    cy.visit('https://<myTestPage.com>')
  })

  it('C1 - h1 is visible test', () => {
    cy.get('h1').should('be.visible')
  })

  context('Other section', () => {
    it('C2 - anchor with caption "Ahoj!" test', () => {
      cy.get('a').contains('Ahoj!').should('be.visible')
    })

    it('C3 - Button with caption "GO!" test', () => {
      cy.get('button').contains('GO!').should('be.visible')
    })
  })
})
```

## Requirements

- Installed [Node.js](https://nodejs.org), [npm](https://npmjs.com) package manager

- Testrail installation with test cases corellates with case ID´s.

- Cypress version >= 10.x.x

- Tested on node version: v18.18.1, npm version 9.8.1 

- Create in folder /cypress/e2e/*.cy.js tests which exists in your Testrail installation with case ID like: Cxxxx, which x means Testrail ID number.

## Installation

clonning repo:

```bash
git clone https://github.com/miroslavkadidlo/cypress-testrail-turbo-reporter.git
```

```bash
cd /<project>

npm install
```

## Run tests

```bash
npm cypress run
```

optional you can use npx

```bash
npx cypress run
```

## .env setup

Create .env file in root of the project

```
# credetials: 
TR_USERNAME = "<email>"
TR_PASSWORD = "<password>"

# project ID: 
TR_PROJECT_ID = <ID number of your Testrail project>
# name of new testrun:
TR_NAME = "<Name of your automated testrun, it´s fully up to you how you want to name it>"
# description of testrun:
TR_DESCRIPTION = "<Description of your automated testrun, it´s fully up to you how you want to name it>"

# create testrun:
TR_URL = "https://<your Testrail installation>.testrail.io/index.php?/api/v2/add_run/"
# get last testrun id:
TR_GET_TESTRUN_ID = "https://<your Testrail installation>.testrail.io/index.php?/api/v2/get_runs/"
# push results: 
TR_RESULTS = "https://<your Testrail installation>.testrail.io/index.php?/api/v2/add_results_for_cases/"
# close testrun: 
TR_CLOSE_TESTRUN = "https://<your Testrail installation>.testrail.io/index.php?/api/v2/close_run/"
```

## Unit tests
TO-DO

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

Grab some issue and fix it :) [Issues](https://github.com/miroslavkadidlo/cypress-testrail-turbo-reporter/issues)

## License

[MIT](https://choosealicense.com/licenses/mit/)
