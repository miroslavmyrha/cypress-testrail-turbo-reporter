const { defineConfig } = require('cypress')
const fs = require('fs').promises
const path = require('path')
const { XMLParser } = require('fast-xml-parser')
const axios = require('axios')
const dotenv = require('dotenv')
const crypto = require('crypto')

dotenv.config()

const STATUS_PASSED = 1
const STATUS_FAILED = 5

const auth = Buffer.from(`${process.env.TR_USERNAME}:${process.env.TR_PASSWORD}`).toString('base64')
const testrailAPIGetTestrunID = process.env.TR_GET_TESTRUN_ID + process.env.TR_PROJECT_ID

const resultsDirectoryPath = path.join(__dirname, `./results/`)
const unitDirectoryPath = path.join(__dirname, `./unitTestsData/`)

module.exports = defineConfig({
  reporter: 'junit',
  reporterOptions: {
    mochaFile: 'results/my-test-output.xml',
  },
  e2e: {
    setupNodeEvents: async (on, config) => {
      on('after:spec', async (results) => {
        if (!results) return
        try {
          const jObj = await parseXMLData('./results/my-test-output.xml')
          const testCases = transformResultsToTestCases(jObj)
          // await writeResultsToFile('./results/all.json', jObj)
          await writeResultsToFile(`./results/my-test-output-${generateRandomString(10)}.json`, testCases)

        } catch (error) {
          console.error(`Error in 'after:spec' event handler: ${error.message}`)
        }
      })

      on('before:run', async (details) => {

        // there should be unit tests
        if (!details) return
        try {

          await deleteAllResultsFiles()

          const dataToCreateTestrun =  {
            "suite_id": process.env.TR_PROJECT_ID,
            "name": process.env.TR_NAME,
            "description": process.env.TR_DESCRIPTION
          }

          const testrailAPIUrl = process.env.TR_URL + process.env.TR_PROJECT_ID
          await makePostRequestTo(testrailAPIUrl, dataToCreateTestrun)


        } catch (error) {
          console.error(error)
        }
      })

      on('after:run', async (details) => {
        if (!details) return
        try {
          const lastTestRunID = await getLastTestrun(testrailAPIGetTestrunID)

          const testrailAPIUrlResults = process.env.TR_RESULTS
          await makePostRequestTo(testrailAPIUrlResults + lastTestRunID, await mergeJSONResults())

          const testrailAPIUrlCloseRun = process.env.TR_CLOSE_TESTRUN
          await makePostRequestTo(testrailAPIUrlCloseRun + lastTestRunID, '')
        } catch (error) {
          console.error(error)
        }
      })
    }
  }
})

async function readFiles(directoryPaPath) {
  try {
    return files = await fs.readdir(directoryPaPath)
  } catch (error) {
    console.error(error)
  }
}

async function deleteAllResultsFiles() {
  for (const file of await readFiles(resultsDirectoryPath) ) {
    try {
      const filePath = path.join(resultsDirectoryPath, file)
      await fs.unlink(filePath)
    } catch (error) {
      console.error(error)
    } 
  }
}

async function mergeJSONResults() {
  try {
    const files = await readFiles(resultsDirectoryPath)
    const mergedResults = []

    for (const file of files) {
      if (file.startsWith('my-test-output-') && file.endsWith('json')) {
        const data = await fs.readFile(path.join(resultsDirectoryPath, file), 'utf8')
        const json = JSON.parse(data)
        mergedResults.push(...json.results)
      }
    }

    await fs.writeFile('./results/merged-results.json', JSON.stringify({ results: mergedResults }, null, 2))
    console.log(JSON.stringify({ results: mergedResults }))
    return JSON.stringify({ results: mergedResults })

  } catch (error) {
    throw new Error(`Error: ${error}`)
  }
}

async function parseXMLData(filePath) {
  try {
    const xmlData = await fs.readFile(filePath, 'utf8')
    const parser = new XMLParser({ ignoreAttributes: false })
    await fs.writeFile('./unitTestsData/outputData/test.json', JSON.stringify(parser.parse(xmlData), null, 2), 'utf-8')
    return parser.parse(xmlData)
  } catch (error) {
    throw new Error(`Error reading XML file: ${error.message}`)
  }
}

function generateRandomString(length) {
  return crypto.randomBytes(length).toString('hex')
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
  } catch (error) {
    throw new Error(`Error writing to file ${filePath}: ${error.message}`)
  }
}

async function makePostRequestTo(url, data) {
  try {
    await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      } 
    })
  } catch (error) {
    console.error(`Error in makePostRequest event handler: ${error.message}`)
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
    console.log(response.data.runs[0].id)
    return response.data.runs[0].id
  } catch (error) {
    console.error(`Error in makePostRequest event handler: ${error.message}`)
  }
}
