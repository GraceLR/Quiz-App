const express = require('express');
const router  = express.Router();

module.exports = (db) => {
  router.get("/", (req, res) => {
    let quizzes = `
      select distinct q.id, count(a.id) from quizzes q
      LEFT JOIN questions qs ON q.id = qs.quiz_id
      LEFT JOIN answers a ON qs.id = a.question_id
      where
        qs.id is not null AND a.id is not null
        AND q.isPrivate = FALSE
      group by q.id, qs.id
      order by q.id DESC
      limit 6
    `;
    console.log(quizzes);
    let questionIds = [];
    const results = {
      quizzes: [],
      questions: {},
      answers: {}
    };
    db.query(quizzes)
      .then((data) => {
        const ids = data.rows.map((item) => parseInt(item.id));
        return db.query(`
          select * from quizzes
          where id  = ANY($1::int[])
          order by id DESC
          `, [ids]
        );
      }).then((quizzesData) => {
        const ids = quizzesData.rows.map((quiz) => parseInt(quiz.id));
        results.quizzes = quizzesData.rows;
        return db.query(`
            select * from questions
            where quiz_id = ANY($1::int[])
            order by id ASC
          `, [ids]);
      }).then((questions) => {
        questionIds = questions.rows.map((q) => parseInt(q.id));

        for (let i = 0; i < results.quizzes.length; i += 1) {
          const quizId = results.quizzes[i].id;
          const questionGroup = questions.rows.filter((q) => q.quiz_id === results.quizzes[i].id);
          questionGroup.sort((a,b) => {
            return a.id - b.id;
          });
          results.questions[quizId] = questionGroup;
        }
        return db.query(`
          select * from answers
          where question_id = ANY($1::int[])
        `, [questionIds]);
      }).then((answers) => {
        if (questionIds && questionIds.length > 0) {
          for (let n = 0; n < questionIds.length; n += 1) {
            const questionId = questionIds[n];
            const answerGroup = answers.rows.filter((a) => a.question_id === questionId);
            answerGroup.sort((a,b) => {
              return a.id - b.id;
            });
            results.answers[questionId] = answerGroup;
          }
        }
        res.json(results);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  return router;
};
