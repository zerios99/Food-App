import express from "express";
import { ENV } from "./config/env.js";
import { db } from "./config/db.js";
import { favoritesTable } from "./db/schema.js";
import { and, eq } from "drizzle-orm";

const app = express();
const port = ENV.PORT || 8001;

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true });
});

app.post("/api/favorites", async (req, res) => {
  try {
    const { userId, recipeId, title, image, cookTime, servings } = req.body;

    if (!userId || !recipeId || !title) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const newFavorite = await db
      .insert(favoritesTable)
      .values({
        userId,
        recipeId,
        title,
        image,
        cookTime,
        servings,
      })
      .returning();

    res.status(201).json({ success: true, data: newFavorite });
  } catch (error) {
    console.error("Error adding favorite:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.delete("/api/favorites/:userId/:recipeId", async (req, res) => {
  try {
    const { userId, recipeId } = req.params;

    await db
      .delete(favoritesTable)
      .where(
        and(
          eq(favoritesTable.userId, userId),
          eq(favoritesTable.recipeId, parseInt(recipeId))
        )
      );

    res
      .status(200)
      .json({ success: true, message: "Favorite removed successfully" });
  } catch (error) {
    console.error("Error removing a favorite:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.get("/api/favorites/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const useFavorites = await db
      .select()
      .from(favoritesTable)
      .where(eq(favoritesTable.userId, userId));

    res.json({ success: true, data: useFavorites });
  } catch (error) {
    console.error("Error getting a favorite:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
