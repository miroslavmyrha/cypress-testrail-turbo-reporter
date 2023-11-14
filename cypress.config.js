const { defineConfig } = require('cypress')
const fs = require('fs').promises
const { XMLParser } = require('fast-xml-parser')
const axios = require('axios')
const dotenv = require('dotenv')
dotenv.config()

const STATUS_PASSED = 1
const STATUS_FAILED = 5

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
  const testSuites = jObj.testsuites.testsuite

  testSuites.forEach(suite => {
    suite.testcase.forEach(testCase => {
      const caseIDMatch = testCase['@_classname'].match(/C\d+/)
      if (!caseIDMatch) return

      const status_id = testCase.failure ? STATUS_FAILED : STATUS_PASSED
      results.results.push({
        case_id: Number(caseIDMatch[0].slice(1)),
        status_id,
      })
    })
  })

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
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${auth}`,
  };

  try {
    await axios.post(url, data, { headers })
  } catch (error) {
    throw new Error(`Error making POST request to ${url}: ${error.message}`)
  }
}

module.exports = defineConfig({
  reporter: 'junit',
  reporterOptions: {
    mochaFile: 'results/my-test-output.xml',
  },
  e2e: {
    setupNodeEvents: async (on, config) => {
      on('after:run', async (spec, results) => {
        if (!results) return

        try {
          const jObj = await parseXMLData('./results/my-test-output.xml')
          const testCases = transformResultsToTestCases(jObj)
          await writeResultsToFile('./results/all.json', jObj)
          await writeResultsToFile('./results/my-test-output.json', testCases)

          const testrailAPIUrl = process.env.TR_RESULTS
          await makePostRequestTo(testrailAPIUrl, testCases)
        } catch (error) {
          console.error(`Error in 'after:run' event handler: ${error.message}`)
        }
      })
    },
  },
})
