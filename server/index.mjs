import express from "express";
import cors from "cors";
import cities from "./cities.mjs";

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
