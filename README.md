# cypress-testrail-turbo-reporter
My own testrail reporter.

- The goal of this project is parse data from junit reporter and send results of tests to Tetsrail API via Axios and create new testrun.
Requirements are only send passed/failed with possible feature extensions in the future.
All essential magic takes place in node events and with hooks in cypress.config.js file.

## Requirements

Installed [Node.js](https://nodejs.org), [npm](https://npmjs.com) package manager

Cypress version >= 10.x.x

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

create in folder /cypress/e2e/*.cy.js tests which exists in your Testrail installation with case ID like: Cxxxx, which x means Testrail ID number.
```

```

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
