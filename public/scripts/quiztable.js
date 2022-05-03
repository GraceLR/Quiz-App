/* eslint-disable no-undef */
// A $( document ).ready() block.
$(document).ready(function($) {
  console.log("ready!");

  const addQuizzes = async() => {
    const response = await fetch('/api/quizzes');
    const { quizzes, questions, answers } = await response.json();

    const quizzesEl = $('.quizzes');
    for (let i = 0; i < quizzes.length; i += 1) {
      const quizId = `quiz_${quizzes[i].id}`;
      quizzesEl.append(`<div id="${quizId}"></div>`);

      const questionsMap = questions[quizzes[i].id].map((item) => {
        return {
          q: item.question,
          options: answers[item.id].map((answer) => answer.answer),
          correctIndex: answers[item.id].findIndex((answer) => answer.iscorrect)
        };
      });

      $(`#${quizId}`).quiz({
        questions: questionsMap
      });
    }

    $('#quiz_1').find('#quiz-restart-btn').click();
    $('.quizzes').find('a').click(function(e) {
      e.preventDefault();
    });

  };

  addQuizzes();
});
