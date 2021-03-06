
const express = require('express');
const router  = express.Router();


module.exports = (db) => {
  router.get("/:shortUrl", (req, res) => {

    const { shortUrl } = req.params;

    let quiz = `
      select * from quizzes
      where shortUrl = $1
      order by id
    `;

    let questionIds = [];
    const results = {
      quizzes: [],
      questions: {},
      answers: {}
    };
    db.query(quiz, [shortUrl])
      .then(data => {
        const ids = data.rows.map((quiz) => parseInt(quiz.id));
        console.log(ids);
        results.quizzes = data.rows;
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
