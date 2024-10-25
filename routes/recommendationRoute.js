import express from "express";

const router = express.Router();

import {
  trackCategoryClick,
  trackSearchQuery,
  getRecommendations,
  clearUserTracks,
} from "../controllers/recommendationController.js";

router.post("/recommendations/track/:category", trackCategoryClick);
router.post("/recommendations/track/search/:searchQuery", trackSearchQuery);
router.get("/get/recommendations", getRecommendations);
router.delete("/clear/tracks", clearUserTracks);

export default router;
