
const express = require('express');
const router  = express.Router();

module.exports = (db) => {

  router.get("/", (req, res) => {

    const url = req.query.urlpassed;
    // if (!url) {

    //   return res.redirect('/');

    // }

    req.session.user_id = 2;
    res.redirect(`/quiz/${url}`);

  });

  router.post("/in", (req, res) => {

    req.session.user_id = 1;
    res.redirect("/");

  });

  router.post("/out", (req, res) => {

    req.session = null;
    res.redirect("/");

  });

return router;

};
