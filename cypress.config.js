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
              let jObj = parser.parse(xmlData)

              fs.writeFileSync('./results/all.json', JSON.stringify(jObj, null, 2) , 'utf-8')

              const other = jObj.testsuites.testsuite[1].testcase

              let arrayOfTestCases = []

              other.forEach((element, index) => {
                if (other[index].failure) {
                  arrayOfTestCases.push(element['@_classname'] + ': failure')
                } else {
                  arrayOfTestCases.push(element['@_classname'])
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
