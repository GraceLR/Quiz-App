/* eslint-disable camelcase */

const express = require('express');
const quizzes = require('./quizzes');
const router  = express.Router();


module.exports = (db) => {
  router.post("/", (req, res) => {
    if (!req.body) {
      res.json({});
      return;
    }

    const {
      user_id,
      shortUrl,
      result
    } = req.body;

    let quiz_id = null;
    db.query(
      `
        SELECT id from quizzes
        where shortUrl = $1
      `, [shortUrl]
    ).then((quiz) => {
      quiz_id = quiz && quiz.rows[0].id;
      db.query(
        `
          select attempt from quiz_attempts
          where quiz_id = $1 AND user_id = $2
          order by attempt DESC
          LIMIT 1
        `, [quiz_id, user_id]
      ).then((attempt) => {
        const lastAttempt = attempt && attempt.rows.length > 0 ? attempt.rows[0].attempt : 0;
        console.log(attempt.rows);
        const thisAttempt = lastAttempt + 1;
        return db.query(
          `
              INSERT INTO quiz_attempts (user_id, quiz_id, attempt, result) VALUES ($1, $2, $3, $4)
              RETURNING *;
            `,
          [user_id, quiz_id, thisAttempt, result ]
        );
      }).then((result) => {
        res.json(result.rows[0]);
      });
    }).catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });
  });
  return router;
};
