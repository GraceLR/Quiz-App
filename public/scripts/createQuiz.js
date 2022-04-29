/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
 */

const escape = function(str) {
  let div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
};

// while clicking Add to my quiz, move to my quiz section

function createQuestionElement(questionData) {

  const $question = $(
    `<article class="question">
      <div>
      <span>${escape(questionData)}</span>
        <button type="submit">Add to my quiz</button>
      </div>
    </article>`);

  return $question;

}

function createMyQuizElement(questionObj) {

  const answe

  const $question = $(
    `<article class="question">
      <div>
      <span>${escape(questionObj.)}</span>
        <button type="submit">Add to my quiz</button>
      </div>
    </article>`);

  return $question;

}

function renderQuestions(questions) {

  const questionsContainer = $('#questions-container');
  questionsContainer.empty();

  for (let i = questions.length - 1; i >= 0; i--) {

    const question = createQuestionElement(questions[i]);
    questionsContainer.append(question);

  }

}

function renderMyQuiz(quizObj) {

  const myquizContainer = $('#myquiz-container');
  myquizContainer.empty();

  for (const question of quizObj) {

    const question = createMyQuizElement(question);
    myquizContainer.append(question);

  }

}

function fetchQuestions() {

  $.ajax({
    url: '/createquiz/all',
    method: 'GET',
    dataType: 'json'
  }).then(all => {

    // extract questions from all table

    const obj = {};
    let questions = [];

    for (const quiz of all) {

      const newQuestion = quiz.question;

      if (obj[newQuestion] === undefined) {

        questions.push(newQuestion);
        obj[newQuestion] = true;

      }

    }

    renderQuestions(questions);

  }).catch(err => {

    console.log(err);

  });

}

function fetchMyQuiz(quizId) {

  $.ajax({
    url: '/createquiz/all',
    method: 'GET',
    dataType: 'json'
  }).then(all => {

    // extract my quiz from all table

    const obj = {};

    for (const quiz of all) {

      const myQuiz = quiz.quiz_id;

      if (obj[myQuiz] === undefined) {

        obj[myQuiz] = {};
        obj[myQuiz][quiz.question] = {};

      }

      obj[myQuiz][quiz.question][quiz.answer] = quiz.iscorrect;

    }

    renderMyQuiz(obj);

  }).catch(err => {

    console.log(err);

  });

}

$(() => {

  fetchQuestions();

  $("#form").on("submit", function(event) {

    event.preventDefault();

    // $("#error").removeAttr("style").hide();
    $("#error").hide();

    const serialized = $(event.target).serialize();
    const question = serialized.substr(5);

    if (question === '' || question === null) {

      $("#error").html('Question content can not be empty.');
      $("#error").show();
      return;

    }

    $.post('/createquiz', serialized)
      .then(() => {

        fetchQuestions();
        // and add the newly created question to my quiz


      })
      .catch(err => {
        console.log(err);
      });

  });

});
