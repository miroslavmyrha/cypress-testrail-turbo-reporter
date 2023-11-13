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
      on('after:run', async (spec, results) => {
        if (results) {
          // Read xml file with results
          fs.readFile('./results/my-test-output.xml', 'utf8', function(err, xmlData) { 
            if (err) {
              console.log('err')
            } else {
  
              // Parsing data with options and write to file
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

              // Object of results frame (In typescript should be interface)  
              let objectOfTestCases = {
                "results": []
              }

              let status_id_result = ''

              // Iteration over test suites to grab testCases
              for (let countOfTestSuites = 1; countOfTestSuites < jObj.testsuites.testsuite.length; countOfTestSuites++) {
                const testCases = jObj.testsuites.testsuite[countOfTestSuites].testcase
                // Iteration over test cases and try regex match
                for (let countOfTestCases = 0; countOfTestCases < jObj.testsuites.testsuite[countOfTestSuites].testcase.length; countOfTestCases++) {
                  const regexpCaseID = /C\d+/
                  const onlyCaseID = testCases[countOfTestCases]['@_classname'].match(regexpCaseID)

                  // 5 - failed, 1 - passed
                  if (testCases[countOfTestCases].failure) {
                    status_id_result = 5
                  } else {
                    status_id_result = 1
                  }

                  // Create object of values and push it to array of results
                  const objectToAppend = {
                    'case_id': Number(onlyCaseID[0].slice(1)),
                    'status_id': status_id_result 
                  }
                  objectOfTestCases.results.push(objectToAppend)
                } 
              }
              // Write results to file
              fs.writeFileSync(
                './results/my-test-output.json', 
                JSON.stringify(
                  objectOfTestCases, null, 2
                ),
                'utf-8'
              )
            }
          })

          // Init enviroment variables needed to send results
          dotenv.config()

          const testrailRunAPIUrl = process.env.TR_URL
          const testrailResultsAPIUrl = process.env.TR_RESULTS
          const closingTestrunAPIUrl = process.env.TR_CLOSE_TESTRUN
          const testrailGetTestrun = process.env.TR_GET_TESTRUN_ID

          // Testrun options
          const dataToCreateTestrun =  {
            "suite_id": 1,
            "name": "New test run",
            "description": "Test run description"
          }


          // Https needed!
          const auth = Buffer.from(`${process.env.TR_USERNAME}:${process.env.TR_PASSWORD}`).toString('base64')

          axios.get(testrailGetTestrun, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${auth}`
            } 
          }).then(response => {
            const testRuns = response.data 
            const lastTestRun = testRuns[0]
          }).catch(error => {
            console.error('Error: ', error)
          })

          // Function which make POST request to Testrail api URLs
          async function makePostRequestTo(testrailAPIUrl, dataObject) {
            try {
              await axios.post(testrailAPIUrl, dataObject, {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Basic ${auth}`
                } 
              })
            } catch (error) {
              console.error(error)
            }
          }

          // Create testrun
          await makePostRequestTo(testrailRunAPIUrl, dataToCreateTestrun)
          // Append results
          await makePostRequestTo(testrailResultsAPIUrl + (lastTestRun + 1), resultsObject)
          // Closing testrun
          await makePostRequestTo(closingTestrunAPIUrl + (lastTestRun + 1), '')
        }
      })
    }
  }
})
