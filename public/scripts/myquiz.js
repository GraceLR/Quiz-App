/* eslint-disable func-style */
/* eslint-disable no-undef */

/*
 * Front end JS logic goes here
 * jQuery is already loaded
 */

const generateRandomString = (length) => {
  let result = '';
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < length; i++) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

let shortUrl = generateRandomString(20);
const escape = function(str) {
  let div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
};

function createQuestionElement(questionData) {

  const $question = $(
    `<article class="question">
      <div class="questionfromdb" id="questionfromdb">
        <span>${escape(questionData)}</span>
        <button name="questionfromdbbutton" id="questionfromdbbutton" type="submit">Add to Quiz</button>
      </div>
    </article>`);

  return $question;

}

function createMyQuizElement(answersObj) {

  const answers = Object.keys(answersObj);

  const $answers = $(
    `<article id="quizpreview-answers">
      <span style="color:#008000;">${escape(answers[0])}</span>
      <span>${escape(answers[1])}</span>
      <span>${escape(answers[2])}</span>
    </article>`);

  return $answers;

  // <button type="delete">Delete</button>

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

  const questions = Object.keys(quizObj);

  for (const question of questions) {

    myquizContainer.append($(
      `<span id= "myquizquestions">${escape(question)}</span>`));

    const answers = createMyQuizElement(quizObj[question]);
    myquizContainer.append(answers);

  }

}

function fetchQuestions(filter) {

  $('#questions-container').empty();

  let sourceUrl = '/quiz/data/allquestions';

  if (filter !== undefined) {

    sourceUrl = '/quiz/data/filteredquestions';

  }

  $.ajax({
    url: sourceUrl,
    method: 'GET',
    data: {catFilter: filter},
    dataType: 'json'
  }).then(questions => {

    let questionsArray = [];

    for (const question of questions) {

      questionsArray.push(question.question);

    }

    renderQuestions(questionsArray);

  }).catch(err => {

    console.log(err);

  });

}

function fetchMyQuiz(myQuizId) {

  return $.ajax({
    url: '/quiz/data/myquizall',
    method: 'GET',
    data: {myquiz: myQuizId},
    dataType: 'json'
  }).then(data => {

    let obj = {};

    for (const ele of data) {

      const question = ele.question;

      if (obj[question] === undefined) {

        obj[question] = {};

      }

      obj[question][ele.answer] = ele.iscorrect;

    }

    renderMyQuiz(obj);

  }).catch(err => {

    console.log(err);

  });

}



let myQuizId = undefined;
let filter = undefined;

$(() => {

  $("#page2").hide();

  $("#quizinfoform").on("submit", function(event) {

    event.preventDefault();

    // $("#error").removeAttr("style").hide();
    $("#error-page1").hide();

    const quizName = $('textarea#quizname').val();
    const quizDescription = $('textarea#quizdescription').val();
    const quizIsPrivate = $('textarea#quizisprivate').val();

    if (quizName === '' || quizName === null) {

      $("#error-page1").html('Quiz name can not be empty.');
      $("#error-page1").show();
      return;

    } else if (quizDescription === '' || quizDescription === null) {

      $("#error-page1").html('Quiz description can not be empty.');
      $("#error-page1").show();
      return;

    } else if (quizIsPrivate === '' || quizIsPrivate === null) {

      $("#error-page1").html('Quiz privacy can not be empty.');
      $("#error-page1").show();
      return;

    }

    $("#page1").hide();
    $("#page2").show();

    $.post('/quiz/quizinfo', {quizName, shortUrl, quizDescription, quizIsPrivate})
      .then(data => {

        myQuizId = data.id;

        $('#myquizpreview-info').append($(
          `<article id="quizpreview-quizinfo">
            <span id="quizinfo">Quiz Name: ${escape(data.name)}</span>
            <span id="quizinfo">Quiz Description: ${escape(data.description)}</span>
            <span id="quizinfo">Quiz URL: ${escape(data.shorturl)}</span>
          </article>`));

      })
      .catch(err => {
        console.log(err);
      });

  });


  fetchQuestions(filter);

  $($('#categoryselect')).change(() => {

    const selected = $('#categoryselect').val();

    if (selected !== $('#categorydefault').val()) {
      filter = selected;
    }

    fetchQuestions(filter);
    filter = undefined;

  });


  $(document).on('click', '#questionfromdbbutton', function() {


    const questionText = $(this).siblings('span').text();
    // seems like quizzes questions many to many is neccesary.
    // ignore so far

    $.ajax({
      url: '/quiz/data/buttonaddquestion',
      method: 'GET',
      data: {questionText: questionText},
      dataType: 'json'
    }).then(questionData => {

      const quizQuestion = questionData[0].question;
      const category = questionData[0].category;
      const correctAnswer = questionData[0].answer;
      const wrongAnswer1 = questionData[1].answer;
      const wrongAnswer2 = questionData[2].answer;

      $.ajax({
        url: '/quiz/data/myquizall',
        method: 'GET',
        data: {myquiz: myQuizId},
        dataType: 'json'
      }).then(data => {

        let obj = {};

        for (const ele of data) {

          const question = ele.question;

          if (obj[question] === undefined) {

            obj[question] = {};

          }

          obj[question][ele.answer] = ele.iscorrect;

        }

        if (data.length === 0 || !obj[quizQuestion]) {

            $.post('/quiz/questions', {myQuizId, quizQuestion, category, correctAnswer, wrongAnswer1, wrongAnswer2})
            .then(() => {

              fetchMyQuiz(myQuizId);

            })
            .catch(err => {
              console.log(err);
            });

        }

      }).catch(err => {

        console.log(err);

      });

    }).catch(err => {

      console.log(err);

    });

  });


  $("#questionsform").on("submit", function(event) {

    event.preventDefault();

    // $("#error").removeAttr("style").hide();
    $("#error-page2").hide();

    if ($('#quizquestion').val() === '' || $('#quizquestion').val() === null) {

      $("#error-page2").html('Question content can not be empty.');
      $("#error-page2").show();
      return;

    } else if ($('textarea#questioncategory').val() === '' || $('textarea#questioncategory').val() === null) {

      $("#error-page2").html('Question category can not be empty.');
      $("#error-page2").show();
      return;

    } else if ($('#correctAnswer').val() === '' || $('#correctAnswer').val() === null) {

      $("#error-page2").html('Correct answer can not be empty.');
      $("#error-page2").show();
      return;

    } else if ($('#wrongAnswer1').val() === '' || $('#wrongAnswer1').val() === null) {

      $("#error-page2").html('Wrong answer can not be empty.');
      $("#error-page2").show();
      return;

    } else if ($('#wrongAnswer2').val() === '' || $('#wrongAnswer2').val() === null) {

      $("#error-page2").html('Wrong answer can not be empty.');
      $("#error-page2").show();
      return;

    } else if ($('#correctAnswer').val() === $('#wrongAnswer1').val() ||
    $('#correctAnswer').val() === $('#wrongAnswer2').val() ||
      $('#wrongAnswer1').val() === $('#wrongAnswer2').val()){

        $("#error-page2").html('Answers can not be the same.');
        $("#error-page2").show();
        return;

    }

    const quizQuestion = $('textarea#quizquestion').val();
    const category = $('textarea#questioncategory').val();
    const correctAnswer = $('textarea#correctAnswer').val();
    const wrongAnswer1 = $('textarea#wrongAnswer1').val();
    const wrongAnswer2 = $('textarea#wrongAnswer2').val();

    $('#quizquestion').val('');
    $('textarea#questioncategory').val('');
    $('#correctAnswer').val('');
    $('#wrongAnswer1').val('');
    $('#wrongAnswer2').val('');

    $.ajax({
      url: '/quiz/data/myquizall',
      method: 'GET',
      data: {myquiz: myQuizId},
      dataType: 'json'
    }).then(data => {

      let obj = {};

      for (const ele of data) {

        const question = ele.question;

        if (obj[question] === undefined) {

          obj[question] = {};

        }

        obj[question][ele.answer] = ele.iscorrect;

      }

      if (data.length === 0 || !obj[quizQuestion]) {

          $.post('/quiz/questions', {myQuizId, quizQuestion, category, correctAnswer, wrongAnswer1, wrongAnswer2})
          .then(() => {

            fetchMyQuiz(myQuizId);

          })
          .catch(err => {
            console.log(err);
          });

      }

    }).catch(err => {

      console.log(err);

    });

  });


  $('#createquizbutton').click(function() {

    window.location.href = `/quiz/${shortUrl}`;
  });



});
