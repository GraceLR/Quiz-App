

/*
 * Some routes for quiz are defined here
 * Since this file is loaded in server.js into /quiz,
 *   these routes are mounted onto /quiz
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();


module.exports = (db) => {

  router.get("/myquiz", (req, res) => {

    db.query(`SELECT DISTINCT category FROM questions;`)
      .then(data => {

        res.render("myquiz", { categories: data.rows});

      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });

  });


  router.get("/data/myquizall", (req, res) => {

    db.query(`SELECT * FROM questions
    join answers on questions.id = answers.question_id
    WHERE quiz_id = $1;`, [req.query.myquiz])
      .then(data => {
        res.json(data.rows);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });

  });

  router.get("/data/allquestions", (req, res) => {

    db.query(`SELECT DISTINCT question FROM questions;`)
      .then(data => {
        res.json(data.rows);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });

  });

  router.get("/data/filteredquestions", (req, res) => {

    db.query(`SELECT DISTINCT question FROM questions WHERE category LIKE '%' || $1 || '%';`, [req.query.catFilter])
      .then(data => {
        res.json(data.rows);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });

  });

  router.get("/data/categories", (req, res) => {

    db.query(`SELECT DISTINCT category FROM questions;`)
      .then(data => {
        res.json(data.rows);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });

  });

  router.post("/quizinfo", (req, res) => {

    const params = req.body;

    const params4 = params.quizIsPrivate === 'yes' ? true : false;

    db.query(`INSERT INTO quizzes (user_id, name, shortUrl, description, isPrivate) VALUES
    ($1, $2, $3, $4, $5) RETURNING *;`, [1, params.quizName, params.shortUrl, params.quizDescription, params4])
      .then(data => {

        res.send(data.rows[0]);

      });

  });


  router.post("/questions", (req, res) => {

    const params = req.body;

    db.query(`INSERT INTO questions (quiz_id, category, question) VALUES
    ($1, $2, $3) RETURNING *;`, [params.myQuizId, params.category, params.quizQuestion])
      .then(data => {

        const answerObj = data.rows[0];



        db.query(`INSERT INTO answers (question_id, answer, isCorrect) VALUES
        ($1, $2, $3);`, [answerObj.id, params.correctAnswer, true])
          .then(data => {



            db.query(`INSERT INTO answers (question_id, answer, isCorrect) VALUES
            ($1, $2, $3);`, [answerObj.id, params.wrongAnswer1, false])
              .then(data => {




                db.query(`INSERT INTO answers (question_id, answer, isCorrect) VALUES
                ($1, $2, $3);`, [answerObj.id, params.wrongAnswer2, false])
                  .then(data => {


                    console.log('sql insert successful for question');

                  })
                  .catch(err => {
                    res
                      .status(500)
                      .json({ error: err.message });
                  });



              })
              .catch(err => {
                res
                  .status(500)
                  .json({ error: err.message });
              });





          })
          .catch(err => {
            res
              .status(500)
              .json({ error: err.message });
          });




        res.send({});
      });

  });

  router.get("/data/buttonaddquestion", (req, res) => {

    // seems like quizzes questions many to many is neccesary.
    // ignore so far
    // there will be multiple records if same question has multiple category.
    db.query(`SELECT temp.question, temp.category, answer, isCorrect from
    (SELECT id, question, category FROM questions WHERE question = $1 LIMIT 1) as temp
    JOIN answers on temp.id = answers.question_id;`,
    [req.query.questionText])
      .then(data => {
        res.json(data.rows);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });

  });


  return router;

};

