let quizData = {
  questions: [],
  questionCounter: 0,
  score: 0,
};

// Question with images to be added to quiz
const quizQuestionsWithImages = [
  {
    question: "Which album art cover is not a Radiohead album",
    answers: [
      {
        text: "./assets/album-one.png",
        alt: "Child's face inside a sunflower",
        correct: false,
      },
      {
        text: "./assets/album-two.png",
        alt: "Glaciers Melting",
        correct: false,
      },
      {
        text: "./assets/album-three.png",
        alt: "'IN RAINBOWS in various colors",
        correct: false,
      },
      {
        text: "./assets/album-four.png",
        alt: "Radio on fire",
        correct: true,
      },
    ],
  },
];

// Countdown time
let countdownTime = 20;

const API_URL = "https://opentdb.com/api.php";

// DOM elements
const quizContainer = document.querySelector(".quiz__container");
const startButton = document.getElementById("quiz-start-button");
const submitButton = document.getElementById("quiz-submit-button");
const nextQuestionButton = document.getElementById("quiz-next-button");
const quizFieldset = document.getElementById("quiz-fieldset");
const quizDifficultyFieldset = document.getElementById("quiz-difficulty-fieldset");
const difficultyErrorMessage = document.querySelector(".difficulty__error-message");
const quizScoreElement = document.querySelector(".quiz__score");
const resultsContainer = document.querySelector(".results__container");
const restartQuizButton = document.getElementById("quiz-restart-button");
const resultsButton = document.getElementById("quiz-results-button");
const quizStatus = document.querySelector(".quiz-status");
const progressBar = document.querySelector(".quiz-status__progress-bar");
const progressBarFill = document.querySelector(".quiz-status__progress-bar-fill");
const progressBarText = document.querySelector(".quiz-status__progress-text");
const progressBarScore = document.querySelector(".quiz-status__score");
const timer = document.querySelector(".quiz-status__timer-text");

// Start Quiz and checks for which difficulty selected and starts timer
const startQuiz = () => {
  const selectedDifficulty = quizDifficultyFieldset.querySelector('input[type="radio"]:checked');
  if (selectedDifficulty) {
    getQuestions(selectedDifficulty.value);
    timerInterval = setInterval(updateCountdown, 1000);
    difficultyErrorMessage.classList.add("hidden");
  } else {
    difficultyErrorMessage.classList.remove("hidden");
    return;
  }
};

// Fetch trivia question data
const getQuestions = (quizDifficulty) => {
  fetch(`${API_URL}?amount=4&category=12&difficulty=${quizDifficulty}&type=multiple`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      // Transforms the results and adds in the image question into a random position storing in quiz data
      const transformedQuizData = transformQuizAnswers(data.results);
      const concatQuizData = quizQuestionsWithImages.concat(transformedQuizData);
      shuffleArray(concatQuizData);
      quizData.questions = concatQuizData;
      // Hide difficulty selection and show quiz and quiz status
      quizDifficultyFieldset.classList.add("hidden");
      quizContainer.classList.remove("hidden");
      populateQuizData();
    })
    .catch((error) => {
      alert("There was a problem with the fetch operation:", error);
    });
};

// Transforms the quiz answers from the API
const transformQuizAnswers = (triviaResults) => {
  return triviaResults.map((item) => {
    let { correct_answer, incorrect_answers, question } = item;

    // Marks the correct answer true and the wrong answers false
    let correctAnswer = { text: correct_answer, correct: true };
    let incorrectAnswers = incorrect_answers.map((answer) => ({
      text: answer,
      correct: false,
    }));
    let answers = [correctAnswer, ...incorrectAnswers];

    // Shuffle the combined array to display randomly on DOM
    shuffleArray(answers);

    return {
      question,
      answers,
    };
  });
};

// Shuffle an array using Fisher-Yates algorithm
const shuffleArray = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    let randomIndex = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[randomIndex]] = [arr[randomIndex], arr[i]];
  }
};

const restartQuiz = () => {
  quizDifficultyFieldset.classList.remove("hidden");
  quizContainer.classList.add("hidden");
  resultsContainer.classList.add("hidden");

  quizDifficultyFieldset.querySelectorAll('input[type="radio"][name="difficulty"]')
    .forEach((input) => (input.checked = false));

  quizData.questions = [];
  quizData.questionCounter = 0;
  quizData.score = 0;
};

// Builds results DOM content and resets quiz
const viewResults = () => {
  const resultsMessage = document.querySelector(".results__score-message");
  resultsMessage.innerHTML = `You got ${quizData.score} out of 5 correct`;

  // Clears input styling and radio inputs
  if (document.querySelector(".incorrect")) {
    document.querySelector(".incorrect").classList.remove("incorrect");
  }
  document.querySelector(".correct").classList.remove("correct");
  document.querySelectorAll('input[type="radio"][name="answer"]').forEach((input) => {
    input.disabled = false;
    input.checked = false;
  });

  // UI and quiz status reset
  quizContainer.classList.add("hidden");
  resultsButton.classList.add("hidden");
  resultsContainer.classList.remove("hidden");
  progressBarFill.style.transform = "scaleX(0)";
  progressBarText.innerHTML = "1 of 5 questions";
  progressBarScore.innerHTML = "0/5 Correct";
  countdownTime = 20;
  timer.innerHTML = "Time Left: 20";
};

/*
  Checks if an answer is selected
  Shows incorrect answer
  Updates score and progress bar
*/
const handleAnswerSubmit = () => {
  const selectedAnswer = quizFieldset.querySelector('input[type="radio"]:checked');

  if (selectedAnswer) {
    updateUiOnSubmit();
    if (selectedAnswer.value === "true") {
      quizData.score += 1;
      progressBarScore.innerHTML = `${quizData.score}/5 Correct`;
    } else {
      selectedAnswer.classList.add("incorrect");
    }
    clearInterval(timerInterval);
  } else if (!selectedAnswer) {
    updateUiOnSubmit();
  }
};

const updateUiOnSubmit = () => {
  // Disables inputs and marks correct input
  const answerInputs = document.querySelectorAll('input[type="radio"][name="answer"]');
  answerInputs.forEach((input) => (input.disabled = true));
  document.querySelector('input[type="radio"][value="true"]').classList.add("correct");

  updateProgressBar();
  quizData.questionCounter++;

  // Hide submit button, show nextbutton, and shows results button if last question
  if (quizData.questionCounter < 5) {
    nextQuestionButton.classList.remove("hidden");
  } else if (quizData.questionCounter === 5) {
    resultsButton.classList.remove("hidden");
  }
  submitButton.classList.add("hidden");
};

const nextQuestion = (e) => {
  e.target.classList.add("hidden");

  // Resets input UI
  if (document.querySelector(".incorrect")) {
    document.querySelector(".incorrect").classList.remove("incorrect");
  }
  document.querySelector(".correct").classList.remove("correct");

  // Re-enable inputs and removes currently checked input
  const answerInputs = document.querySelectorAll('input[type="radio"][name="answer"]');
  answerInputs.forEach((input) => {
    input.disabled = false;
    if (input.checked) {
      input.checked = false;
    }
  });

  populateQuizData();

  // Resets quiz Status UI
  progressBarText.innerHTML = `${quizData.questionCounter + 1} of 5 questions`;
  countdownTime = 20;
  timer.innerHTML = "Time Left: 20";
  timerInterval = setInterval(updateCountdown, 1000);
  submitButton.classList.add("hidden");
};

const populateQuizData = () => {
  // Update current questions
  const quizLegend = document.querySelector(".quiz__question");
  quizLegend.innerHTML = quizData.questions[quizData.questionCounter].question;

  /*
    Loops through qurrent quiz questions and populates inputs and labels
    Checks if current question is the question with images, creates image tag
  */
  if (quizData.questions[quizData.questionCounter].question === "Which album art cover is not a Radiohead album") {
    quizData.questions[quizData.questionCounter].answers.forEach(
      (answer, index) => {
        let label = document.querySelector(`label[for="quiz_control_${index + 1}"]`);
        label.innerHTML = "";

        let image = document.createElement("img");
        image.classList.add("quiz__input-image");
        image.src = answer.text;
        image.width = 150;
        image.height = 150;
        image.alt = answer.alt;
        label.appendChild(image);

        document.getElementById(`quiz_control_${index + 1}`).value = answer.correct;
      }
    );
  } else {
    quizData.questions[quizData.questionCounter].answers.forEach((answer, index) => {
        document.getElementById(`quiz_control_${index + 1}`).value = answer.correct;
        document.querySelector(`label[for="quiz_control_${index + 1}"]`).innerHTML = answer.text;
      }
    );
  }
};

const updateProgressBar = () => {
  let scaleAmount = (quizData.questionCounter + 1) / 5;
  progressBarFill.style.transform = `scaleX(${scaleAmount})`;
};

const updateCountdown = () => {
  if (countdownTime < 1) {
    clearInterval(timerInterval);
    handleAnswerSubmit();
    timer.innerHTML = `Time's Up!`;
  } else {
    countdownTime--;
    timer.innerHTML = `Time Left: ${countdownTime}`;
  }
};

// Event listenders
restartQuizButton.addEventListener("click", restartQuiz);
resultsButton.addEventListener("click", viewResults);
submitButton.addEventListener("click", handleAnswerSubmit);
nextQuestionButton.addEventListener("click", nextQuestion);
startButton.addEventListener("click", startQuiz);

// Toggles submit button when input has been selected
quizFieldset
  .querySelectorAll('input[type="radio"][name="answer"]')
  .forEach((input) => {
    input.addEventListener("click", () => {
      if (submitButton.classList.contains("hidden")) {
        submitButton.classList.remove("hidden");
      }
    });
  });
