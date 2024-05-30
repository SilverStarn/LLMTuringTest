const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const db = require("./db");
const game = require("./game");
const multer = require("multer");
const sharp = require("sharp");
const { Pool } = require("pg");
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static("public"));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const mySecret = process.env["DBPassword"]; // h89vc8SszkV7tSY9gUJGDw

// PostgreSQL pool configuration using environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  user: "flexfroggy",
  host: "arctic-husky-13344.5xj.cockroachlabs.cloud",
  database: "users_management",
  password: mySecret,
  port: 26257,
  ssl: {
    rejectUnauthorized: false,
  },
});

//The session middleware with a secure session secret
app.use(
  session({
    store: new pgSession({
      pool: pool,
      tableName: "user_session",
    }),
    secret: process.env.SESSION_SECRET || "local-secret",
    resave: true,
    saveUninitialized: false,
    cookie: {
      maxAge: 2 * 24 * 60 * 60 * 1000, // Cookie expiration set to 2 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    },
  }),
);

// Multer setup for file uploads
// Existing Multer setup
const upload = multer({
  storage: multer.memoryStorage(), // Change to memory storage
  limits: { fileSize: 1024 * 1024 * 5 },
});

app.post(
  "/uploadProfilePhoto",
  upload.single("profilePhoto"),
  async (req, res) => {
    try {
      const userId = req.session.user.id;
      // Process the image using sharp
      const processedImage = await sharp(req.file.buffer)
        .resize(200, 200) // Resize to 100x100
        .png() // Convert to png
        .toBuffer();

      // Save processed image to disk (implement your own logic)
      const filePath = `uploads/${req.file.originalname}`;
      await sharp(processedImage).toFile(`public/${filePath}`);
      await db.updateUserProfilePhoto(userId, req.file.originalname); // Update in the database
      res.redirect("/profile");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },
);

// For signing up
app.post("/signup", async (req, res) => {
  try {
    const { username, password, email } = req.body;
    if (!username || !password) {
      return res.status(400).send("Username and password are required");
    }

    const result = await db.registerUser(username, password, email);
    const user = result.rows[0];
    req.session.user = { id: user.id, username: user.username };
    console.log("signup result: ", result);
    res.status(201).send(`User created with Username: ${user.username}`);
  } catch (error) {
    // Unique constraint violation
    if (error.code === "23505") {
      return res.status(409).send("Username already exists");
    }
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Route for user login
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).send("Username and password are required");
    }

    // Checking if user exists
    const userResult = await db.authenticateUser(username, password);
    const user = userResult.rows[0];

    if (user.id === 0) {
      return res.status(401).json({ message: "Such account doesn't exist" });
    }

    if (user.id === -1) {
      // The same message sent to enhance the security
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Initialize user session here
    req.session.user = { id: user.id, username: user.username };
    const userInfo = req.session.user.id;
    console.log("user id = ", userInfo);
    res.status(200).json({ message: "Login successful" }); // Redirect after successful login
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
});

app.get("/", (req, res) => {
  console.log(req.session.user);
  res.render("index", { user: req.session.user });
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html", "signup.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html", "about.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html", "login.html"));
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Could not log out.");
    }
    res.redirect("/login");
  });
});

app.get("/play", (req, res) => {
  res.render("play", { user: req.session.user, isCreated: undefined });
});

app.get("/playHost", (req, res) => {
  res.render("playHost", { user: req.session.user });
});

app.get("/playTester", async (req, res) => {
  const user = req.session.user;
  const gameData = await db.getRandomGame();
  const userData = await db.getUserData(user.id);
  const userScores = `${userData.num_correct_answers} / ${userData.num_games_played}`;

  if (gameData && userData) {
    res.render("playTester", {
      user: user,
      userData: userData,
      gameData: gameData,
      isCorrectGuess: undefined,
      userScores: userScores,
    });
  } else {
    res.status(500).send("Unable to fetch game data");
  }
});

app.get("/profile", async (req, res) => {
  if (!req.session.user) {
    // Redirect to login if not authenticated
    return res.redirect("/login");
  }

  try {
    const userId = req.session.user.id;
    // You need to create this function
    const user = await db.getUserData(userId);
    // You need to create this function
    //const gameStats = await db.getUserGameStats(userId);

    res.render("profile", { user: user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/submitAnswer", async (req, res) => {
  try {
    if (
      !req.body.answer ||
      isNaN(
        req.body.answer ||
          !req.body.aiAnwerIndex ||
          isNaN(req.body.aiAnswerIndex),
      )
    ) {
      console.error("Invalid input for answer or aiAnswerIndex");
      return res.status(400).send("Invalid input received");
    }
    // Extract the selected answer from the request body
    const userChoiceIndex = parseInt(req.body.answer);
    const aiAnswerIndex = parseInt(req.body.aiAnswerIndex);
    const isCorrectGuess = userChoiceIndex === aiAnswerIndex;
    const user = req.session.user;

    // Update the stats for the user
    await db.updateUserStats(user.id, false, isCorrectGuess);

    // Grab the updated stats for the user
    const userData = await db.getUserData(user.id);
    const userScores = `${userData.num_correct_answers} / ${userData.num_games_played}`;

    const gameData = await db.getRandomGame();
    if (!gameData) {
      console.error("Failed to fetch new game data");
      return res.status(500).send("Error fetching new game data");
    }
    res.render("playTester", {
      user: user,
      gameData: gameData,
      isCorrectGuess: isCorrectGuess,
      userScores: userScores,
    });
  } catch (error) {
    console.error("Error in submitting answer:", error);
    res.status(500).send("Error processing your answer");
  }
});

app.post("/addNewGame", async (req, res) => {
  try {
    const { question, user_answer } = req.body;

    if (!question) {
      return res.status(400).send("Question required");
    }

    if (!user_answer) {
      return res.status(400).send("Answer required");
    }
    console.log("user answer value: ", question);
    console.log("user answer type: ", question);
    console.log(typeof question);
    const questionForAI = question + ".Answer with few words.";
    let aiAnswer = await game.LLMTest(questionForAI);

    if (!aiAnswer) {
      return res.status(500).send("Error fetching AI answer");
    }

    /* 
      user_answer and ai_answer are string list for the future development after
      we graduate, where multiple user answers and ai answers will be for each test
    */
    // Removing potential signs of ai answers from the ai response
    aiAnswer = aiAnswer.replace(/\n/g, " ");
    aiAnswer = aiAnswer.replace(/\./g, "");
    aiAnswer = aiAnswer.replace(/Answer:/g, "");
    const result = await db.addNewGame({
      question,
      user_answer: user_answer,
      ai_answer: aiAnswer,
    });
    if (!result) {
      return res.status(500).send("Error adding new game");
    }
    // Update the stats for the user
    const user = req.session.user;
    await db.updateUserStats(user.id, true, false);
    res.render("play", { user: user, isCreated: true }); // Redirect after successful login
    return result;
  } catch (error) {
    console.error(error);
    res.status(500).send("Error");
  }
});

app.post("/deleteAccount", async (req, res) => {
  try {
    const userId = req.session.user.id;
    await db.deleteUserAccount(userId);
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.error("Account deletion error:", error);
    res.status(500).send("Error deleting account");
  }
});

app.listen(port, async () => {
  console.log(`Server running at http://localhost:${port}`);
});
