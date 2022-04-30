// load .env data into process.env
require("dotenv").config();
const bodyParser = require('body-parser');


// Web server config
const PORT = process.env.PORT || 8080;
const sassMiddleware = require("./lib/sass-middleware");
const express = require("express");
const app = express();
const morgan = require("morgan");
app.use(express.json());


// PG database client/connection setup
const { Pool } = require("pg");
const dbParams = require("./lib/db.js");
const db = new Pool(dbParams);
<<<<<<< HEAD
db.connect(() => {
  console.log('connected to database');
});

=======
console.log(dbParams);
db.connect();
>>>>>>> b1c66ba69099ecb3a12e4bdcc5e84f39d81913a7

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
// The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan("dev"));

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(
  "/styles",
  sassMiddleware({
    source: __dirname + "/styles",
    destination: __dirname + "/public/styles",
    isSass: false, // false => scss, true => sass
  })
);

app.use(express.static("public"));

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
// const usersRoutes = require("./routes/users");
// const widgetsRoutes = require("./routes/widgets");
<<<<<<< HEAD
const quizRouts = require("./routes/quiz");

=======
const createquizRouts = require("./routes/createquiz");
const apiQuiziesRoute = require("./routes/api/quizzes");

// api routes
app.use("/api/quizzes", apiQuiziesRoute(db));
>>>>>>> b1c66ba69099ecb3a12e4bdcc5e84f39d81913a7



// Mount all resource routes
// Note: Feel free to replace the example routes below with your own

// app.use("/api/users", usersRoutes(db));
// app.use("/api/widgets", widgetsRoutes(db));
<<<<<<< HEAD
app.use("/quiz", quizRouts(db));

=======
app.use("/createquiz", createquizRouts(db));
>>>>>>> b1c66ba69099ecb3a12e4bdcc5e84f39d81913a7

// Note: mount other resources here, using the same pattern above

// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).


app.get("/", (req, res) => {
  res.render("index");
});

app.get("/startQuiz", (req, res) => {
  res.render("startQuiz");
});

app.listen(PORT, () => {
  console.log(`Quiz app listening on port ${PORT}`);
});
