
/*
 * Front end JS logic goes here
 * jQuery is already loaded
 */

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
        <button name="questionfromdbbutton" id="questionfromdbbutton" type="submit">Add to my quiz</button>
      </div>
    </article>`);

  return $question;

}

function createMyQuizElement(answersObj) {

  const answers = Object.keys(answersObj);

  const $answers = $(
    `<article class="answers">
      <div>
      <span>${escape(answers[0])}</span>
      <span>${escape(answers[1])}</span>
      <span>${escape(answers[2])}</span>
      </div>
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
  // myquizContainer.empty();

  const questions = Object.keys(quizObj);

  for (const question of questions) {

    myquizContainer.append($(
      `<article class="questions">
        <span>${escape(question)}</span>
      </article>`));

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

    renderMyQuiz(obj);

  }).catch(err => {

    console.log(err);

  });

}



let myQuizId = undefined;
let filter = undefined;

$(() => {

  $("#questionsform").hide();
  $("#questions-container").hide();
  $("#categoryform").hide();
  $("#myquiz-container").hide();
  $("#createquiz").hide();

  $("#quizinfoform").on("submit", function(event) {

    event.preventDefault();

    // $("#error").removeAttr("style").hide();
    $("#error").hide();

    const quizName = $('textarea#quizname').val();
    const quizDescription = $('textarea#quizdescription').val();
    const quizIsPrivate = $('textarea#quizisprivate').val();

    if (quizName === '' || quizName === null) {

      $("#error").html('Quiz name can not be empty.');
      $("#error").show();
      return;

    } else if (quizDescription === '' || quizDescription === null) {

      $("#error").html('Quiz description can not be empty.');
      $("#error").show();
      return;

    } else if (quizIsPrivate === '' || quizIsPrivate === null) {

      $("#error").html('Quiz privacy can not be empty.');
      $("#error").show();
      return;

    }

    $("#quizinfoform").hide();
    $("#questionsform").show();
    $("#questions-container").show();
    $("#categoryform").show();
    $("#myquiz-container").show();
    $("#createquiz").show();

    $.post('/quiz/quizinfo', {quizName, quizDescription, quizIsPrivate})
      .then(data => {

        myQuizId = data.id;

        $('#myquiz-container').append($(
          `<article class="quizinfo">
            <div>
            <span>${escape(data.name)}</span>
            <span>${escape(data.description)}</span>
            </div>
          </article>`));


      })
      .catch(err => {
        console.log(err);
      });

  });


  fetchQuestions(filter);

    $($('#categoryselect')).change(() => {

      const selected = $('#categoryselect').val();

      if (selected !== $('#categorydefault').val()){
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

      $.post('/quiz/questions', {myQuizId, quizQuestion, category, correctAnswer, wrongAnswer1, wrongAnswer2})
      .then(() => {

        fetchMyQuiz(myQuizId);

      })
      .catch(err => {
        console.log(err);
      });

    }).catch(err => {

      console.log(err);

    });

  });


  $("#questionsform").on("submit", function(event) {

    event.preventDefault();

    // $("#error").removeAttr("style").hide();
    $("#error").hide();

    const quizQuestion = $('#quizquestion').val();
    const category = $('textarea#category').val();
    const correctAnswer = $('#correctAnswer').val();
    const wrongAnswer1 = $('#wrongAnswer1').val();
    const wrongAnswer2 = $('#wrongAnswer2').val();

    if (quizQuestion === '' || quizQuestion === null) {

      $("#error").html('Question content can not be empty.');
      $("#error").show();
      return;

    } else if (category === '' || category === null) {

      $("#error").html('Question category can not be empty.');
      $("#error").show();
      return;

    } else if (correctAnswer === '' || correctAnswer === null) {

      $("#error").html('The correct answer for the question can not be empty.');
      $("#error").show();
      return;

    } else if (wrongAnswer1 === '' || wrongAnswer1 === null) {

      $("#error").html('The first wrong answer for the question can not be empty.');
      $("#error").show();
      return;

    } else if (wrongAnswer1 === '' || wrongAnswer1 === null) {

      $("#error").html('The second wrong answer for the question can not be empty.');
      $("#error").show();
      return;

    }


    $('#quizquestion').val('');
    $('textarea#category').val('');
    $('#correctAnswer').val('');
    $('#wrongAnswer1').val('');
    $('#wrongAnswer2').val('');

    $.post('/quiz/questions', {myQuizId, quizQuestion, category, correctAnswer, wrongAnswer1, wrongAnswer2})
      .then(() => {

        // fetchQuestions();
        fetchMyQuiz(myQuizId);

      })
      .catch(err => {
        console.log(err);
      });

  });

  const generateRandomString = (length) => {
    let result = '';
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < length; i++) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
  };

  $('#createquizbutton').click(function(){

    window.location.href= '/quiz/' + myQuizId + generateRandomString(20);

 })



});
