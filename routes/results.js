/* eslint-disable camelcase */

const express = require('express');
const router  = express.Router();

const getResultsById = (db, req, res) => {
  const { attemptId } = req.params;
  const attemptQuery = attemptId ? `AND id = $2` : '';
  const queryVars = attemptId ? ['3', attemptId] : ['3'];
  let lastResult = `
    select * from quiz_attempts
    where user_id = $1
    ${attemptQuery}
    order by attempt DESC
    LIMIT 1
  `;
  let result = {};
  db.query(lastResult, queryVars)
    .then(data => {
      result = data.rows && data.rows[0];
      const { quiz_id } = result;
      console.log(quiz_id);
      return db.query(
        `
          SELECT qz.*, count(q.id) as "questionCount" FROM quizzes qz
          LEFT JOIN questions q ON qz.id = q.quiz_id
          WHERE qz.id = $1
          GROUP BY qz.id
        `,
        [quiz_id]
      );
    }).then((quiz) => {
      console.log(quiz.rows);
      const vars = {
        ...quiz.rows[0],
        result
      };
      res.render('results', { vars });
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });
};


module.exports = (db) => {
  router.get("/", (req, res) => {
    getResultsById(db, req, res);
  });

  router.get("/:attemptId", (req, res) => {
    getResultsById(db, req, res);
  });
  return router;
};
