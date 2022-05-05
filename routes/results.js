/* eslint-disable camelcase */

const express = require('express');
const router  = express.Router();

const getResultsById = (db, req, res) => {
  const { shortUrl } = req;
  const { attemptId } = req.params;
  console.log(attemptId);
  const attemptQuery = attemptId ? `AND id = $2` : '';
  const queryVars = attemptId ? [3, attemptId] : [3];
  let lastResult = `
    select * from quiz_attempts
    WHERE
      user_id = $1
      ${attemptQuery}
    order by attempt DESC
    LIMIT 1
  `;
  let result = {};
  let prevResult = {};
  let quiz_id = null;

  db.query(lastResult, queryVars)
    .then(data => {
      result = data.rows && data.rows[0];
      quiz_id = result.quiz_id;
      console.log(quiz_id);
      console.log(result);

      return db.query(`
        select * from quiz_attempts
        WHERE
          user_id = $1
          AND quiz_id = $2
          AND id < $3
        ORDER BY id DESC
        LIMIT 1
      `, [3, quiz_id, attemptId]);
    }).then((prev) => {
      prevResult = prev.rows[0];
      return db.query(
        `
          SELECT qz.*, count(q.id) as "questionCount"
          FROM quizzes qz
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
        result,
        prevResult
      };
      console.log(vars.questionCount);
      const loggedInUser = req.session.user_id;
      res.render('results', { vars, loggedInUser });
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });
};


module.exports = (db, shortUrl) => {
  router.get("/", (req, res) => {
    getResultsById(db, req, res, shortUrl);
  });

  router.get("/:attemptId", (req, res) => {
    getResultsById(db, req, res, shortUrl);
  });
  return router;
};
