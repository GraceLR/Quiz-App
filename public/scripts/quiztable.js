const getQuestions = async function(quiz_id,limit = 4) {

  return pool
    .query(
      `SELECT questions, answer`,
      [quiz_id,limit])
    .then((result) => {
      console.log(result);
      return {
        id: result.rows.quiz_id,
        questions,
        answer
      };
    })
    .catch((err) => {
      console.error(err.message);
    });

};
