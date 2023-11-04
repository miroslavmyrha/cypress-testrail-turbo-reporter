const { defineConfig } = require('cypress')
const fs = require('fs')
const { XMLParser, XMLBuilder, XMLValidator} = require("fast-xml-parser")

module.exports = defineConfig({
  reporter: 'junit',
  reporterOptions: {
    mochaFile: 'results/my-test-output.xml',
    toConsole: true,
  },
  // setupNodeEvents can be defined in either
  // the e2e or component configuration
  e2e: {
    setupNodeEvents(on, config) {
      on('after:spec', (spec, results) => {
        if (results) {
          console.log('after:spec hook was called')
          fs.readFile('./results/my-test-output.xml', 'utf8', function(err, xmlData) { 
            if (err) {
              console.log('err')
            } else {
              // Display the file content 
              console.log(xmlData)
              console.log('xmlData has been readed.')

              const options = {
                ignoreAttributes: false
              }

              const parser = new XMLParser(options)
              const jObj = parser.parse(xmlData)

              fs.writeFileSync('./results/all.json', JSON.stringify(jObj, null, 2) , 'utf-8')

              const testCase = jObj.testsuites.testsuite[1].testcase

              let arrayOfTestCases = {}

              testCase.forEach((element, index) => {
                const caseLabelLength = element['@_classname'].length
                const sliced = element['@_classname'].slice(0, -(caseLabelLength - 5))

                if (testCase[index].failure) {
                  arrayOfTestCases[sliced] = 'failure'
                } else {
                  arrayOfTestCases[sliced] = ''
                }
              })

              fs.writeFileSync('./results/my-test-output.json', JSON.stringify(arrayOfTestCases, null, 2) , 'utf-8')
            }
          })
        }
      })
    }
  }
})
