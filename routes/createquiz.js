/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();

module.exports = (db) => {

  router.get("/:quizid/questions", (req, res) => {
    req.session.quiz_id = req.params.quizid;
    let templateVar = { quizId: req.params.quizid};
    res.render('../views/questions', templateVar);
  })

  router.get("/:quizid/questions/:questionid", (req, res) => {
    db.query(`SELECT question FROM questions WHERE id = $1`, [req.params.questionid])
    .then(data => {
      let question = data.rows[0].question;
      let templateVars = {quiz_id: req.params.quizid, question_id: req.params.questionid, question};
      res.render('../views/answers', templateVars);
    })
  })

  router.post("/:quizid/questions", (req, res) => {
    let query = `INSERT INTO questions (quiz_id, question)
                VALUES ($1, $2) RETURNING *`;
    let values = [req.params.quizid, req.body.question];
    req.session.quiz_id = req.params.quizid;
    db.query(query, values)
      .then(data => {
        const question = data.rows;
        let questionID = question[0].id
        res.redirect(`/quiz/${req.params.quizid}/questions/${questionID}`);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
    });

  return router;
};






    // router.get("/quizzes", (req, res) => {
    //   res.render("createquizQuizzes");
    // });


    // router.get("/all", (req, res) => {

    //   db.query(`SELECT * FROM quizzes
    //   join questions on quizzes.id = questions.quiz_id
    //   join answers on questions.id = answers.question_id;`) // need to fetch quiz, qustions, answers
    //     .then(data => {
    //       console.log(data.rows)
    //       res.json(data.rows);
    //     })
    //     .catch(err => {
    //       res
    //         .status(500)
    //         .json({ error: err.message });
    //     });

    // });


//   db.query(`INSERT INTO quizzes (name, description, user_id, isPrivate) VALUES
//   ($1, $2, $3, $4) returning *;`, params)
//     .then(data => {
//       const users = data.rows;

//       db.query(`INSERT INTO questions (name, description, quiz_id, isPrivate) VALUES
//       ($1, $2, $3, $4);`, params)  // the quiz_id
//         .then(data => {
//           const users = data.rows;
//           res.json({ users });

//         })
//         .catch(err => {
//           res
//             .status(500)
//             .json({ error: err.message });
//         });

//     });

//   });

// return router;

// };




// copy from apiRoutes
// create database.js
// check server.js is fine
