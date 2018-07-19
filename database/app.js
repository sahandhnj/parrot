const express = require('express');
const bodyParser = require('body-parser');
const pool = require('./db');
const audioData = require('./routes/databaseDataRoute');

const app = express();

app.use(bodyParser.json());
app.use('/audiolog', audioData);

app.use((err, req, res, next) => {
  res.json(err);
})

const port = 3000;

app.listen(port, function () {
  console.log(`Listening on port ${port}.`);
});
