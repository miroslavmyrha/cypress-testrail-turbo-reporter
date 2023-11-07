const { defineConfig } = require('cypress')
const fs = require('fs')
const { XMLParser } = require('fast-xml-parser')
const axios = require('axios')
const dotenv = require('dotenv')

module.exports = defineConfig({
  reporter: 'junit',
  reporterOptions: {
    mochaFile: 'results/my-test-output.xml'
  },
  // reporter: 'junit',
  // reporterOptions: {
  //   mochaFile: 'results/my-test-output.xml'
  // },
  // setupNodeEvents can be defined in either
  // the e2e or component configuration
  e2e: {
    setupNodeEvents(on, config) {
      on('after:spec', async (spec, results) => {
        if (results) {
          fs.readFile('./results/my-test-output.xml', 'utf8', function(err, xmlData) { 
            if (err) {
              console.log('err')
            } else {
              // Display the file content 

              const options = {
                ignoreAttributes: false
              }

              const parser = new XMLParser(options)
              const jObj = parser.parse(xmlData)

              fs.writeFileSync(
                './results/all.json', 
                JSON.stringify(
                  jObj, null, 2
                ), 
                'utf-8'
              )

              const testCases = jObj.testsuites.testsuite[1].testcase

              let objectOfTestCases = {}

              testCases.forEach((testCase, index) => {
                const caseLabelLength = testCase['@_classname'].length
                // ID case label in format(Cxxxx)
                const sliceOnlyCaseID = testCase['@_classname'].slice(0, -(caseLabelLength - 5))

                if (testCases[index].failure) {
                  objectOfTestCases[sliceOnlyCaseID] = 'failure'
                } else {
                  objectOfTestCases[sliceOnlyCaseID] = ''
                }
              })

              fs.writeFileSync(
                './results/my-test-output.json', 
                JSON.stringify(
                  objectOfTestCases, null, 2
                ),
                'utf-8'
              )
            }
          })

          dotenv.config()

          async function login() {
            try {
              await axios.post(process.env.TR_URL, {
                user: process.env.TR_USERNAME,
                password: process.env.TR_PASSWORD
               },
               {
                 headers: {
                   'Content-Type': 'application/json'
                 }
               })
            } catch (error) {
              console.error(error)
            }
          }

          await login()

        }
      })
    }
  }
})
