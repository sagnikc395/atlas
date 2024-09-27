import express from "express";
import cors from "cors";
import cities from "./cities.mjs";
import fs from "fs:promises";

const app = express();
const PORT = process.env.PORT || 7890;

app.use(cors());
app.use(express.json());

//get the daily word
app.get("/api/daily", (req, res) => {
  const currDate = new Date();
  const seed =
    currDate.getFullYear() * 1000 +
    (currDate.getMonth() + 1) * 100 +
    currDate.getDate();

  const idx = seed % cities.length;
  res.json({
    word: cities[idx].word,
    hints: {
      hint1: cities[idx].hint1,
      hint2: cities[idx].hint2,
      hint3: cities[idx].hint3,
    },
  });
});

// log for analytics
const logAnalytics = async (e) => {
  const logfile = path.join(__dirname, "analytics.log");
  const logEntry = `${new Date().toISOString()} - ${JSON.stringify(e)}\n`;
  try {
  } catch (e) {
    console.error(`Error logging analytics : ${e}`);
  }
};

// API endpoint to log analytics events
app.post("/api/log-event", (req, res) => {
  const { event } = req.body;
  logAnalytics(event);
  res.sendStatus(200);
});

const invalidWordsLogPath = path.join(__dirname, "invalid_words.log");
const invalidWordsCache = new Set();

// Function to log invalid words
const logInvalidWord = async (word) => {
  const logEntry = `${new Date().toISOString()} - ${word}\n`;
  try {
    await fs.appendFile(invalidWordsLogPath, logEntry);
    invalidWordsCache.add(word);
    console.log("Invalid word logged:", word);
  } catch (error) {
    console.error("Error logging invalid word:", error);
  }
};

// API endpoint to log invalid words
app.post("/api/log-invalid-word", async (req, res) => {
  const { word } = req.body;
  if (!invalidWordsCache.has(word)) {
    await logInvalidWord(word);
  }
  res.sendStatus(200);
});

// API endpoint to get invalid words log
app.get("/api/invalid-words", async (req, res) => {
  try {
    if (invalidWordsCache.size === 0) {
      const data = await fs.readFile(invalidWordsLogPath, "utf8");
      const words = data
        .split("\n")
        .filter(Boolean)
        .map((line) => line.split(" - ")[1]);
      invalidWordsCache.clear();
      words.forEach((word) => invalidWordsCache.add(word));
    }
    res.json(Array.from(invalidWordsCache));
  } catch (error) {
    console.error("Error reading invalid words log:", error);
    res.status(500).json({ error: "Error retrieving invalid words" });
  }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build/index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
