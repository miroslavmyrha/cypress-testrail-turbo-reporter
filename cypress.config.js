const { defineConfig } = require('cypress')
const fs = require('fs')
const { XMLParser } = require('fast-xml-parser')
const axios = require('axios')
const https = require('node:https')

module.exports = defineConfig({
  reporter: 'junit',
  reporterOptions: {
    mochaFile: 'results/my-test-output.xml'
  },
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

              // axios({
              //   method: 'get',
              //   url: 'https://reqres.in/api/users?page=2',
              //   headers: { 'Content-Type': 'application/json' }
              // })
              // .then(function (response) {
              //   return response
              // })


                     


              // axios.get('https://reqres.in/api/users?page=2')
              //   .then(function (response) {
              //     // handle success
              //     console.log(response)
              //   })
              //   .catch(function (error) {
              //     // handle error
              //     console.log(error)
              //   })
              //   .finally(function () {
              //     console.log('finished! :)')
              //   })





              // axios.get('https://reqres.in/api/users?page=2')
              //   .then(function (response) {
              //     // handle success
              //     console.log(response)
              //   })
              //   .catch(function (error) {
              //     // handle error
              //     console.log(error)
              //   })
              //   .finally(function () {
              //     console.log('finished! :)')
              //   })


              // axios.get('https://my-api.com/cats')
              // .then(function (response) {
              //   // handle success
              //   console.log(response)

              //   fs.writeFileSync(
              //     './results/from-axios.json', 
              //     JSON.stringify(
              //       response, null, 2
              //     ),
              //     'utf-8'
              //   )
              // })
              // .catch(function (error) {
              //   // handle error
              //   console.log(error)
              // })
              // .finally(function () {
              //   // always executed
              // })

            }
          })

          async function getUser() {
            try {
              const response = await axios.get('https://reqres.in/api/users?page=2');
              console.log(response.data);
            } catch (error) {
              console.error(error);
            }
          }

          await getUser()     

        }
      })
    }
  }
})
