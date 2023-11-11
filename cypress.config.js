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

              let objectOfTestCases = {}

              for (let countOfTestSuites = 1; countOfTestSuites < jObj.testsuites.testsuite.length; countOfTestSuites++) {
                const testCases = jObj.testsuites.testsuite[countOfTestSuites].testcase
                console.log(jObj.testsuites.testsuite.length)
  
                for (let countOfTestCases = 0; countOfTestCases < jObj.testsuites.testsuite[countOfTestSuites].testcase.length; countOfTestCases++) {
                  const regexpCaseID = /C\d+/
                  const onlyCaseID = testCases[countOfTestCases]['@_classname'].match(regexpCaseID)
      
                  if (testCases[countOfTestCases].failure) {
                    objectOfTestCases[onlyCaseID[0]] = 'failure'
                  } else {
                    objectOfTestCases[onlyCaseID[0]] = ''
                  }
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

          const testrailRunURL = process.env.TR_URL
          const testrailResultsURL = process.env.TR_RESULTS
          const closingTestrun = process.env.TR_CLOSE_TESTRUN

          const testrailResultsTest1 = {
            "results": [
              {
                "case_id": 1,
                "status_id": 1
              },
              {
                "case_id": 2,
                "status_id": 5
              }
            ]
          }

          // create testrun

          const dataToCreateTestrun =  {
            "suite_id": 1,
            "name": "New test run",
            "description": "Test run description"
          }

          const auth = Buffer.from(`${process.env.TR_USERNAME}:${process.env.TR_PASSWORD}`).toString('base64')

          async function createPostRequestTo(testrailRunURL, dataToCreateTestrun) {
            try {
              await axios.post(testrailRunURL, dataToCreateTestrun, {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Basic ${auth}`
                } 
              }
             )
            } catch (error) {
              console.error(error)
            }
          }

          await createPostRequestTo(testrailRunURL, dataToCreateTestrun)
          await createPostRequestTo(testrailResultsURL, testrailResultsTest1)
          await createPostRequestTo(closingTestrun, '')
        }
      })
    }
  }
})
