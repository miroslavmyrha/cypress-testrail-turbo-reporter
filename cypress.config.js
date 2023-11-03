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

          function parse() {
            fs.readFile('./results/my-test-output.xml', 'utf8', function(err, xmlData) { 
              if (err) {
                console.log(err)
              } else {
                // Display the file content 
                console.log(xmlData)
                console.log('xmlData has been readed.')

                const parser = new XMLParser()
                let jObj = parser.parse(xmlData)

                console.log(jObj)
              }
            })
          }

          parse()

        }
      })
    }
  }
})
