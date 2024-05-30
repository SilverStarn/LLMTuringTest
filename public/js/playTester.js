/*
* Name: Woo Sik Choi & Adeel Sultan
* Date: 11/22/2023
* Description: Handling advanced effects for playTester.ejs page
*/



window.onload = function() {
  const answerContainers = document.querySelectorAll('#answer-container');

  answerContainers.forEach((container, index) => {
    const radio = container.querySelector('input[type="radio"]');
    radio.addEventListener('change', function (event) {
      // Clear the previously selected answer
      const previousSelected = document.querySelector('#answer-container.selected');
      if (previousSelected) {
        previousSelected.classList.remove('selected');
      }

      // Select the clicked answer
      container.classList.add('selected');
    });
  });

  // Handle next question visibility
  setTimeout(function() {
    var nextQuestion = document.getElementById('game-container');
    nextQuestion.style.display = 'block';

    // Wait for a moment before adding the 'visible' class
    setTimeout(function() {
      nextQuestion.classList.add('visible');
    }, 100); // Short delay before starting the opacity transition
  }, 1000); // Delay of 4 seconds to account for alert box fade out

  // Handle alert box
  const correctAlertBox = document.getElementById('correct-answer');
  if (correctAlertBox) {
    setTimeout(function() {
      correctAlertBox.style.opacity = '0';
    }, 2000); // Alert box fades out after 2 seconds
  }

  const wrongAlertBox = document.getElementById('wrong-answer');
  if (wrongAlertBox) {
    setTimeout(function() {
      wrongAlertBox.style.opacity = '0';
    }, 2000); // Alert box fades out after 2 seconds
  }
};