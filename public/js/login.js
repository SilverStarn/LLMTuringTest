/*
 * Name: Woo Sik Choi & Adeel Sultan
 * Date: 11/22/2023
 * Description: A js file for handling login.html
 */

//add event handler for login form
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");

  //add event handler for submit button
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    //send login request to server
    fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      //if login is successful, redirect to home page, otherwise catch alert user of login error
      .then((response) => response.json()) // Convert the response to JSON
      .then((data) => {
        // 'data' is the JSON object received from the server
        if (data.message === "Login successful") {
          window.location.href = "/"; // Redirect on successful login
        } else {
          alert(data.message); // Use the message from the server
        }
      })
      .catch((error) => {
        // Handle any errors that occurred during the fetch process
        console.error("Error during login:", error);
        alert("Error during login. Please try again.");
      });
  });
});
