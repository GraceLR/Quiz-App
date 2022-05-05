// load .env data into process.env
require("dotenv").config();
const bodyParser = require('body-parser');

// Web server config
const PORT = process.env.PORT || 8080;
const sassMiddleware = require("./lib/sass-middleware");
const express = require("express");
const app = express();
const cookieSession = require("cookie-session");
const morgan = require("morgan");
app.use(express.json());
app.use(cookieSession({ name: "session", secret: "purple-dinosaur" }));

// PG database client/connection setup
const { Pool } = require("pg");
const dbParams = require("./lib/db.js");
const db = new Pool(dbParams);
db.connect(() => {
  console.log('connected to database');
});


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

const quizRouts = require("./routes/quiz");
const sessionRouts = require("./routes/session");
const apiQuiziesRoute = require("./routes/api/quizzes");
const apiGetQuizRoute = require("./routes/api/get-quiz");
const apiPostResultsRoute = require('./routes/api/post-results');
const resultsRoute = require("./routes/results");

app.use("/quiz", quizRouts(db));
app.use("/session", sessionRouts(db));
app.use("/api/quizzes", apiQuiziesRoute(db));
app.use("/api/quiz/results", apiPostResultsRoute(db));
app.use("/api/quiz", apiGetQuizRoute(db));

// Note: mount other resources here, using the same pattern above

// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).

app.use("/quiz/:shortUrl/results", resultsRoute(db));

app.get("/quiz/:shortUrl", (req, res) => {

  const loggedInUser = req.session.user_id;
  const urlPass = req.params.shortUrl;
  const link = 'http://localhost:8080/session?urlpassed=' + urlPass;

  if (!loggedInUser) {


    return res.send("Please <a href='" + link + "'>Login</a> first.");
  }

  res.render("startQuiz", {loggedInUser});
});

app.get("/", (req, res) => {

  const loggedInUser = req.session.user_id;

  res.render("index", {loggedInUser});
});

app.listen(PORT, () => {
  console.log(`Quiz app listening on port ${PORT}`);
});
