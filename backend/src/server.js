import express from "express";
import { ENV } from "./config/env.js";

const app = express();

const port = ENV.PORT || 8001;

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true });
});

app.post("/api/favorite", async (req, res) => {
  try {
    const { userId, recipeId, title, image, cookTime, servings } = req.body;
  } catch (error) {}
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
