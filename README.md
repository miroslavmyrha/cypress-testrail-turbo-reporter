# cypress-testrail-turbo-reporter
My own testrail reporter.

- The goal of this project is parse data from junit reporter and send results of tests to Tetsrail API via Axios.
- Requirements are only send passed/failed with possible feature extensions in the future.
- All essential magic takes place in node events and with hooks in cypress.config.js file.
- Results are parsed, merged and preprocessed in /results folder

## Requirements

Installed [Node.js](https://nodejs.org), [npm](https://npmjs.com) package manager

Cypress version >= 10.x.x

Create in folder /cypress/e2e/*.cy.js tests which exists in your Testrail installation with case ID like: Cxxxx, which x means Testrail ID number.

## Installation

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

```
# credetials: 
TR_USERNAME = "<email>"
TR_PASSWORD = "<password>"

# project ID: 
TR_PROJECT_ID = <ID number of your Testrail project>
# name of new testrun:
TR_NAME = "<Name of your automated testrun>"
# description of testrun:
TR_DESCRIPTION = "<Description of your automated testrun>"

# create testrun:
TR_URL = "https://<your Testrail installation>.testrail.io/index.php?/api/v2/add_run/"
# get last testrun id:
TR_GET_TESTRUN_ID = "https://<your Testrail installation>.testrail.io/index.php?/api/v2/get_runs/"
# push results: 
TR_RESULTS = "https://<your Testrail installation>.testrail.io/index.php?/api/v2/add_results_for_cases/"
# close testrun: 
TR_CLOSE_TESTRUN = "https://<your Testrail installation>.testrail.io/index.php?/api/v2/close_run/"
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
