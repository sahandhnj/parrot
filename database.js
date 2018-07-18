
// var express = require('express');
// var pg = require('pg');
// var app = express();

const pg        = require('pg');
const express   = require('express');
const app       = express();
const { Client } = require('pg')
const client = new Client()
const pool = new pg.Pool(config);

const config = {
    user: 'postgres',
    database: 'parrotdb',
    password: 'postgresadmin',
    port: 5432
};

testInput = {
  primary_key: 0,
  file_name: 'audio.wav',
  audio_content: 'bla bla'
}

function insertData () {
  app.get('/', (req, res, next) => {
     pool.connect(function (err, client, done) {
         if (err) {
             console.log("Can not connect to the DB" + err);
         }
         client.query('BEGIN');
         client.query("INSERT INTO parrotlog(primary_key, file_name, audio_content) VALUES (0, 'audio.wav', 'bla bla bla')", function (err, result) {
              client.query('COMMIT');
              done();
              if (err) {
                  console.log(err);
                  res.status(400).send(err);
              }
              res.status(200).send(result.rows);
         })
     })
  });
}

insertData();



const query = {
  text: "INSERT INTO parrotlog(primary_key, file_name, audio_content) VALUES (0, 'audio.wav', 'bla bla bla')",
  values: ['brianc', 'brian.m.carlson@gmail.com'],
}

// const pool = new pg.Pool(config);

// pool takes the object above -config- as parameter
// const pool = new pg.Pool(config);

// app.get('/', (req, res, next) => {
//    pool.connect(function (err, client, done) {
//        if (err) {
//            console.log("Can not connect to the DB" + err);
//        }
//        client.query('BEGIN');
//        client.query("INSERT INTO parrotlog(primary_key, file_name, audio_content) VALUES (0, 'audio.wav', 'bla bla bla')", function (err, result) {
//             client.query('COMMIT');
//             done();
//             if (err) {
//                 console.log(err);
//                 res.status(400).send(err);
//             }
//             res.status(200).send(result.rows);
//        })
//    })
// });



app.listen(4000, function () {
    console.log('Server is running.. on Port 4000');
});






// pool takes the object above -config- as parameter
// const pool = new pg.Pool(config);

// app.get('/', (req, res, next) => {
//    pool.connect(function (err, client, done) {
//        if (err) {
//            console.log("Can not connect to the DB" + err);
//        }
//        client.query('SELECT * FROM parrotlog', function (err, result) {
//             done();
//             if (err) {
//                 console.log(err);
//                 res.status(400).send(err);
//             }
//             res.status(200).send(result.rows);
//        })
//    })
// });
//
// app.listen(4000, function () {
//     console.log('Server is running.. on Port 4000');
// });


// retrieve input
function retrieveInput (fileId, contentString) {
  var newItem = {
    fileId,
    contentString
  };
  return newItem;
};

// connect with the psql database


// write content to database using query
// take in account the pk




test = retrieveInput("test", "test");
console.log(test);
