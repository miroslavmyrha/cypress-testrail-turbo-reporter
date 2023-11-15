const { defineConfig } = require('cypress')
const fs = require('fs').promises
const { XMLParser } = require('fast-xml-parser')
const axios = require('axios')
const dotenv = require('dotenv')
dotenv.config()

const STATUS_PASSED = 1
const STATUS_FAILED = 5

const auth = Buffer.from(`${process.env.TR_USERNAME}:${process.env.TR_PASSWORD}`).toString('base64')

module.exports = defineConfig({
  reporter: 'junit',
  reporterOptions: {
    mochaFile: 'results/my-test-output.xml',
  },
  e2e: {
    setupNodeEvents: async (on, config) => {
      on('after:spec', async (spec, results) => {
        if (!results) return
        try {
          const dataToCreateTestrun =  {
            "suite_id": 1,
            "name": "New test run",
            "description": "Test run description"
          }
          const jObj = await parseXMLData('./results/my-test-output.xml')
          const testCases = transformResultsToTestCases(jObj)
          await writeResultsToFile('./results/all.json', jObj)
          await writeResultsToFile('./results/my-test-output.json', testCases)

          const testrailAPIUrl = process.env.TR_URL
          await makePostRequestTo(testrailAPIUrl, dataToCreateTestrun)

          const testrailAPIGetTestrunID = process.env.TR_GET_TESTRUN_ID
          const lastTestrun = await getLastTestrun(testrailAPIGetTestrunID)

          const testrailAPIUrlResults = process.env.TR_RESULTS
          await makePostRequestTo(testrailAPIUrlResults + lastTestrun, testCases)

          const testrailAPIUrlCloseRun = process.env.TR_CLOSE_TESTRUN
          await makePostRequestTo(testrailAPIUrlCloseRun + lastTestrun, '')

        } catch (error) {
          console.error(`Error in 'after:spec' event handler: ${error.message}`)
        }
      })
    }
  }
})

async function parseXMLData(filePath) {
  try {
    const xmlData = await fs.readFile(filePath, 'utf8')
    const parser = new XMLParser({ ignoreAttributes: false })
    return parser.parse(xmlData)
  } catch (err) {
    throw new Error(`Error reading XML file: ${err.message}`)
  }
}

function transformResultsToTestCases(jObj) {
  const results = { results: [] }
  for (let countOfTestSuites = 1; countOfTestSuites < jObj.testsuites.testsuite.length; countOfTestSuites++) {
    const testCases = jObj.testsuites.testsuite[countOfTestSuites].testcase
    // Iteration over test cases and try regex match
    for (let countOfTestCases = 0; countOfTestCases < jObj.testsuites.testsuite[countOfTestSuites].testcase.length; countOfTestCases++) {
      const regexpCaseID = /C\d+/
      const caseIDMatch = testCases[countOfTestCases]['@_classname'].match(regexpCaseID)

      const status_id = testCases[countOfTestCases].failure ? STATUS_FAILED : STATUS_PASSED
      results.results.push({
        case_id: Number(caseIDMatch[0].slice(1)),
        status_id,
      })
    }
  }
  return results
}

async function writeResultsToFile(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    throw new Error(`Error writing to file ${filePath}: ${err.message}`)
  }
}

async function makePostRequestTo(url, data) {
  const auth = Buffer.from(`${process.env.TR_USERNAME}:${process.env.TR_PASSWORD}`).toString('base64')
  try {
    await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      } 
    })
  } catch (error) {
    console.error(`Error in 'after:run' event handler: ${error.message}`)
  }
}

async function getLastTestrun(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      }
    })
    return response.data.runs[0].id
  } catch (error) {
    console.error(`Error in 'after:run' event handler: ${error.message}`)
  }
}
