const { Router } = require('express');
const pool = require('../db');
const router = Router();

router.get('/', function (request, response, next) {
  pool.query("SELECT * FROM audiolog", function (err, res) {
    if (err) return next(err);

    response.json(res.rows);
    // console.log(res.rows);
  });
});

router.post('/', function (request, response, next) {
  const { file_name, audio_content } = request.body;

  pool.query(
    'INSERT INTO audiolog (file_name, audio_content) VALUES ($1, $2)',
    [file_name, audio_content],
    (err, res) => {
      if (err) return next(err);

      response.redirect('/audiolog');
      console.log(`Audio file ${file_name} added to database`)
    }
  );
});

module.exports = router;
