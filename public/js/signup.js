/*
 * Name: Woo Sik Choi & Adeel Sultan
 * Date: 11/22/2023
 * Description: A js file for handling signup.html
 */

//window.location.href = './html/login';
const MIN_PASSWORD_LENGTH = 8;
const MIN_USERNAME_LENGTH = 8;

//add event handler for signup form when content loads
document.addEventListener("DOMContentLoaded", () => {
  //parse html elements into objects
  const form = document.getElementById("signup-form");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const emailInput = document.getElementById("email");

  //add event handler for submit button
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = usernameInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const email = emailInput.value;

    //invoke validate functions
    let validationError = validatePassword(password, confirmPassword);
    if (validationError) {
      alert(validationError);
      return;
    }
    validationError = validateUsername(username);
    if (validationError) {
      alert(validationError);
      return;
    }
    //if no validation errors, send signup request to server
    fetch("/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, email }),
    })
      .then((response) => {
        if (response.ok) {
          alert("Account successfully created!");
          // Redirect to login page on success
          window.location.href = "/login";
        }
      })
      //catch and alert user of errors
      .catch((error) => {
        console.error("Error creating an account: ", error);
        alert("Error creating an account");
      });
  });
});

//validate password
function validatePassword(password, confirmPassword) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password is too short. It should be at least ${MIN_PASSWORD_LENGTH} characters long`;
  }
  if (password != confirmPassword) {
    return "Passwords don't match";
  }

  return null;
}

//validate username
function validateUsername(username) {
  if (username.length < MIN_USERNAME_LENGTH) {
    return "Username is too short";
  }
  if (username.includes(" ")) {
    return "Username has space";
  }

  return null;
}
