
# LLM Live Turing Test
Developed by Woo Sik Choi & Adeel Sultan

## Description

The primary purpose of this project is to create an interactive online platform that tests how closely current Language Learning Models (LLMs) can mimic human responses. 
Users can sign up, log in, and choose to play as a host or a player (tester). Hosts can create questions and provide human-generated answers, while the platform fetches responses from an LLM (using OpenAI's API). 
Players are then given a mix of human and AI answers and must guess which one is generated by the LLM.

## Features
1. User Authentication
  Sign Up: Users can create a new account by providing a username, password, and email.
  Login: Users can log in to their accounts using their credentials.
  Session Management: User sessions are managed to keep users logged in across different pages.

2. Role Selection
  Host: Users can choose to be a host and create new tests by writing questions and human-generated answers.
  Player (Tester): Users can choose to be a player and take tests by guessing which answers are human-generated and which are AI-generated.

3. Game Management
  Create Tests: Hosts can create new tests with questions and answers. The system fetches AI-generated answers using the OpenAI API.
  Take Tests: Players can take tests and guess which answers are from humans and which are from the AI.
  Random Game Selection: The system can randomly select a game for the player to participate in.

4. Profile Management
  Update Profile: Users can update their profile photos and view their game statistics.
  Delete Account: Users can delete their accounts, which removes their profile and associated data.

5. Responsive Design
  The user interface is designed to be responsive and user-friendly, with a visually appealing background and centered buttons for ease of use.

6. Technology Stack - Backend
  Node.js: The server-side runtime environment.
  Express.js: The web application framework for routing and middleware.
  PostgreSQL: The database system for storing user profiles, sessions, and game data.
  bcrypt: For hashing passwords securely.
  multer: For handling file uploads (profile photos).
  sharp: For image processing.
  OpenAI API: To fetch AI-generated responses.-Frontend
7. Technology Stack - Frontend  HTML: For structuring the web pages.
  CSS: For styling the web pages.
  JavaScript: For client-side scripting and DOM manipulation.
  EJS: Embedded JavaScript templating for rendering dynamic content.
8. Development Tools:
  Replit: An online IDE for development and testing.


## Prerequisites

- Node.js
- npm or yarn

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/SilverStarn/LLMTuringTest.git
    ```

2. Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

3. Create a `.env` file based on the `.env.example`:
    ```bash
    cp .env.example .env
    ```

4. Fill in the environment variables in the `.env` file.

## Running the Project

To start the server, run:
```bash
npm start
# or
yarn start
