let hostButton = document.getElementById("host");
let playerButton = document.getElementById("player");
let promptLabel = document.getElementById("prompt-label");

let hostMessage = 'Write a test for other players to play!';
let playerMessage = 'Figure out which response was written by an AI!';
let promptLabelMessage = 'Choose Your Role!';

window.onload = function() {
// Handle alert box
const uploadAlertBox = document.getElementById('question-created');
if (uploadAlertBox) {
  setTimeout(function() {
    uploadAlertBox.style.opacity = '0';
  }, 2000); // Alert box fades out after 2 seconds
}
}


hostButton.addEventListener('mouseover', () => {
    promptLabel.innerHTML= hostMessage;
});

hostButton.addEventListener('mouseout', () => {
  promptLabel.innerHTML= promptLabelMessage;
});

playerButton.addEventListener('mouseover', () => {
  promptLabel.innerHTML= playerMessage;
});

playerButton.addEventListener('mouseout', () => {
  promptLabel.innerHTML= promptLabelMessage;
});



