const express = require('express');
const router  = express.Router();
module.exports = (db) => {
  router.get("/", (req, res) => {
    db.query(`SELECT * FROM users;`)
      .then(data => {
        const users = data.rows;
        res.json({ users });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

router.get('/:id', (req, res) => {
  db.query(`SELECT * FROM users WHERE id = $1;`, [req.params.id])
    .then(user => {
      res.json(user.rows[0]);
    })
    .catch(error => {
      res
        .status(500)
        .json({ error: error.message });
    });
});

router.get("/createquiz/:userid", (req, res) => {
  req.session.user_id = req.params.userid;
  let templateVar = { userId: req.params.userid};
  res.render('../views/createQuiz', templateVar);
})


router.post("/:userid/createquiz", (req, res) => {
  let query = `INSERT INTO quizzes (user_id, name, description, category, isPrivate)
              VALUES ($1, $2, $3, $4, $5) RETURNING id`;
  let values = [req.params.userid, req.body.name, req.body.description, req.body.isPrivate];
  db.query(query, values)
    .then(data => {
      const quiz = data.rows;
      let quizid = data.rows[0].id
      res.redirect(`/quiz/${quizid}/questions`);
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });
  });
return router;
};
