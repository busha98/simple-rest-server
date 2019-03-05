const express = require('express')
const bodyParser = require('body-parser');
const {BigQuery} = require('@google-cloud/bigquery')
const { configure, getLogger } = require('log4js');


const schema = require('./schema')
const {PORT, GOOGLE_APPLICATION_CREDENTIALS, projectId, tableId, datasetId, LOGGER_FILE_PATH} = require('./.env')


const app = express()
const bigquery = new BigQuery({
  keyFilename: GOOGLE_APPLICATION_CREDENTIALS,
  projectId: projectId,
})
const logger = getLogger()
configure({
  appenders: { cheese: { type: 'file', filename: LOGGER_FILE_PATH } },
  categories: { default: { appenders: ['cheese'], level: 'trace' } }
});

app.use(bodyParser.json())

app.all('/', function (req, res) {
  console.dir(req.body)
  const { event } = req.body

  if (event) { event.aliases = event.aliases && event.aliases.toString() }

  bigquery
  .dataset(datasetId)
  .table(tableId)
  .insert([event])
  .then(() => res.send('Test'))
  .catch(err => {
    logger.error(err, req.body)
    res.send(err)
  })
})

app.listen(PORT)

// CREATE TABLE
// bigquery.dataset(datasetId).createTable(tableId, {schema}).then(console.log).catch(console.log)
