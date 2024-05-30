/*
 * Name: Woo Sik Choi & Adeel Sultan
 * Date: 11/22/2023
 * Description: Database related functionalities
 */

const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const mySecret = process.env["DBPassword"];

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  user: "flexfroggy",
  host: "arctic-husky-13344.5xj.cockroachlabs.cloud",
  database: "users_management",
  password: mySecret,
  port: 26257,
  ssl: {
    // The necessary part because without this, the letters won't show up.
    rejectUnauthorized: false,
  },
});

pool.connect();

// Creating user account ('C' from 'CRUD')
async function registerUser(username, password, email) {
  try {
    const saltRounds = 10; // Number of salt rounds for bcrypt
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    const result = await pool.query(
      "INSERT INTO user_profile (username, hash, email, salt) VALUES ($1, $2, $3, $4) RETURNING username, hash, email, salt",
      [username, hashedPassword, email, salt],
    );
    console.log("User registration result:", result);
    return result;
  } catch (error) {
    console.log("Error registering user: ", error);
  }
}

async function authenticateUser(username, password) {
  try {
    const result = await pool.query(
      "SELECT * FROM user_profile WHERE username = $1",
      [username],
    );
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const hashedPassword = user.hash; // Get the hashed password from the database
      // bcrypt asynchronously compares the plain password with the hashed password. It handles the intricacies of the salt internally.
      const match = await bcrypt.compare(password, hashedPassword);
      if (!match) {
        console.error("Username or password is wrong!");
        return { rows: [{ id: -1 }] };
      }
      // Login successful, return the user row
      return result;
    } else {
      return { rows: [{ id: 0 }] };
    }
  } catch (error) {
    console.error("Error in authenticateUser:", error);
    throw { rows: [] };
  }
}

// Reading user account ('R' from 'CRUD')
async function getUserData(userId) {
  try {
    const result = await pool.query(
      "SELECT * FROM public.user_profile WHERE id = $1",
      [userId],
    );
    if (result.rows.length > 0) {
      const user = result.rows[0];
      return user; // Return the user data
    } else {
      console.error("User not found");
      return { rows: [] }; // Return null if user not found
    }
  } catch (error) {
    console.error("Error in getUserData:", error);
    throw error; // Rethrow the error for the caller to handle
  }
}

// Deleting user account ('D' from 'CRUD')
async function deleteUserAccount(userId) {
  try {
    // Delete user sessions
    await pool.query("DELETE FROM public.user_session WHERE sid = $1", [
      userId,
    ]);

    // Delete user profile
    await pool.query("DELETE FROM public.user_profile WHERE id = $1", [userId]);

    // Commit the transaction
  } catch (error) {
    throw error;
  }
}

// Update user account profile ('U' from 'CRUD')
async function updateUserProfilePhoto(userId, filePath) {
  const query =
    "UPDATE public.user_profile SET profile_photo = $1 WHERE id = $2";
  try {
    const result = await pool.query(query, [filePath, userId]);
    console.log(`Updated ${result.rowCount} row(s)`);
    return result.rowCount > 0;
  } catch (error) {
    console.error("Error updating user profile photo:", error);
    throw error;
  }
}

// Update user stats
async function updateUserStats(userId, isHost, isCorrect) {
  let query;
  if (isHost) {
    query =
      "UPDATE public.user_profile SET num_games_created = num_games_created + 1 WHERE id = $1";
  } else if (isCorrect) {
    // Test player so we update num_games
    query =
      "UPDATE public.user_profile SET num_games_played = num_games_played + 1, num_correct_answers = num_correct_answers + 1 WHERE id = $1";
  } else {
    query =
      "UPDATE public.user_profile SET num_games_played = num_games_played + 1 WHERE id = $1";
  }

  try {
    const result = await pool.query(query, [userId]);
    console.log(`Updated ${result.rowCount} row(s)`);
    return result.rowCount > 0;
  } catch (error) {
    console.error("Error updating user profile photo:", error);
    throw error;
  }
}

async function addNewGame(gameData) {
  try {
    const { question, user_answer, ai_answer } = gameData;

    // If you try to add a same question to the game, it will cause an error and won't be added to the table.

    const queryText =
      "INSERT INTO public.games (question, user_answer, ai_answer) VALUES ($1, $2, $3) RETURNING question, user_answer, ai_answer";
    const queryParams = [question, user_answer, ai_answer];
    const result = await pool.query(queryText, queryParams);
    return result.rows[0]; // Return the new game row
  } catch (error) {
    console.error("Error in addNewGame:", error);
    throw error; // Rethrow the error for the caller to handle
  }
}

// In-memory storage to keep track of selected game ids.
const selectedGames = new Set();

const getRandomGame = async () => {
  try {
    // Convert the set of selected IDs to an array for the query.
    const selectedIdsArray = Array.from(selectedGames);
    // Get a random gamethat hasn't been selected yet.
    let queryText =
      "SELECT * FROM public.games WHERE id != ALL($1) ORDER BY RANDOM() LIMIT 1";
    const res = await pool.query(queryText, [selectedIdsArray]);

    if (res.rows.length === 0) {
      selectedGames.clear();
      queryText = "SELECT * FROM public.games ORDER BY random() LIMIT 1";
      res = await client.query(queryText);
    } else {
      const game = res.rows[0];
      // To keep tracking on an ai answer
      const allAnswers = [
        { text: game.user_answer, isAI: false },
        { text: game.ai_answer, isAI: true },
      ];

      // Randomly order the answers before passing into playTester.ejs
      shuffleArray(allAnswers);

      const aiAnswerIndex = allAnswers.findIndex((a) => a.isAI);

      return {
        question: game.question,
        answers: allAnswers.map((a) => a.text),
        aiAnswerIndex,
      };
    }
  } catch (error) {
    console.error("Error fetching game:", error);
    return null;
  }
};

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

module.exports = {
  updateUserProfilePhoto,
  registerUser,
  getUserData,
  authenticateUser,
  addNewGame,
  getRandomGame,
  shuffleArray,
  deleteUserAccount,
  updateUserStats,
};
