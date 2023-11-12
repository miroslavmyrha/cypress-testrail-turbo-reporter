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

              let objectOfTestCases = {
                "results": []
              }

              let status_id_result = ''

              for (let countOfTestSuites = 1; countOfTestSuites < jObj.testsuites.testsuite.length; countOfTestSuites++) {
                const testCases = jObj.testsuites.testsuite[countOfTestSuites].testcase
  
                for (let countOfTestCases = 0; countOfTestCases < jObj.testsuites.testsuite[countOfTestSuites].testcase.length; countOfTestCases++) {
                  const regexpCaseID = /C\d+/
                  const onlyCaseID = testCases[countOfTestCases]['@_classname'].match(regexpCaseID)

                  // 5 - failed, 1 - passed
                  if (testCases[countOfTestCases].failure) {
                    status_id_result = 5
                  } else {
                    status_id_result = 1
                  }

                  const objectToAppend = {
                    'case_id': Number(onlyCaseID[0].slice(1)),
                    'status_id': status_id_result 
                  }
                  objectOfTestCases.results.push(objectToAppend)
                } 
              }
             
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

          const testrailRunAPIUrl = process.env.TR_URL
          const testrailResultsAPIUrl = process.env.TR_RESULTS
          const closingTestrunAPIUrl = process.env.TR_CLOSE_TESTRUN

          // create testrun
          const dataToCreateTestrun =  {
            "suite_id": 1,
            "name": "New test run",
            "description": "Test run description"
          }


          // https needed!
          // const auth = Buffer.from(`${process.env.TR_USERNAME}:${process.env.TR_PASSWORD}`).toString('base64')

          // async function makePostRequestTo(testrailAPIUrl, dataObject) {
          //   try {
          //     await axios.post(testrailAPIUrl, dataObject, {
          //       headers: {
          //         'Content-Type': 'application/json',
          //         'Authorization': `Basic ${auth}`
          //       } 
          //     }
          //    )
          //   } catch (error) {
          //     console.error(error)
          //   }
          // }

          // // create testrun
          // await makePostRequestTo(testrailRunAPIUrl, dataToCreateTestrun)
          // // append results
          // await makePostRequestTo(testrailResultsAPIUrl, testrailResultsTest1)
          // // closing testrun
          // await makePostRequestTo(closingTestrunAPIUrl, '')
        }
      })
    }
  }
})
