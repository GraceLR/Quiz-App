// A $( document ).ready() block.
$(document).ready(function($) {
  console.log("ready!");

  const addQuizzes = async() => {
    const response = await fetch('/api/quizzes');
    const { quizzes, questions, answers } = await response.json();

    for (const quiz of quizzes) {
      const divId = `quiz_${quiz.id}`;
      const quizQuestions = questions[quiz.id];
      const quizAnswers = answers[quizQuestions[0].id];
      console.log(quiz.name);

      const htmlAnswers = quizAnswers.map((answer, index) => {
        return `<li>${answer.answer}</li>`;
      }).join('');
      const htmlQuestions = `
      <div class="question-container">
        <p class="question">${quizQuestions[0].question}</p>
        <ul class="answers">
          ${htmlAnswers}
        </ul>
      </div>`;

      const quizLink = `http://localhost:8080/quiz/${quiz.shorturl}`;
      const htmlQuiz = `
          <div id="${divId}" class="quiz-container quiz-questions-state">
            <h3><a href="${quizLink}">${quiz.name}</a></h3>
            ${htmlQuestions}
          </div>
      `;
      $(`.quizzes`).append(htmlQuiz);
    }

  };

  addQuizzes();
});
