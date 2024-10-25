import recommendationModel from "../models/recommendation.js";
import postModel from "../models/post.js";

import jwt from "jsonwebtoken";

// Add the user clicks for recommendations
export const trackCategoryClick = async (req, res) => {
  try {
    // Extract the token from the Authorization header
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Decode the JWT token
    const userId = decoded.id; // Extract the userId from the token
    console.log(userId);

    const { category } = req.params;

    // Track the user's category click
    await recommendationModel.create({ category, userId });

    res.status(200).json({ message: "Category click tracked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error tracking category click" });
  }
};

export const trackSearchQuery = async (req, res) => {
  try {
    // Extract the token from the Authorization header
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Decode the JWT token
    const userId = decoded.id; // Extract the userId from the token

    const { searchQuery } = req.params; // Extract searchQuery from the URL parameters

    // Check if searchQuery is provided
    if (!searchQuery) {
      return res.status(400).json({ message: "Search query is required." });
    }

    // Track the user's search query
    await recommendationModel.create({ searchQuery, userId }); // Properly passing searchQuery

    res.status(200).json({ message: "Search query tracked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error tracking search query" });
  }
};

// Get product recommendations for a user based on interactions (likes, saves, category clicks, search queries)
export const getRecommendations = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Fetch all recommendations for the user
    const recommendations = await recommendationModel.find({ userId });

    const recommendedCategories = recommendations
      .filter((rec) => rec.category !== null)
      .map((rec) => rec.category);

    const recommendedSearchQueries = recommendations
      .filter((rec) => rec.searchQuery !== null)
      .map((rec) => rec.searchQuery);

    // Fetch recommended posts/products based on user activity
    // Assuming you have a `productModel` to fetch the products.
    const recommendedProducts = await postModel.find({
      $or: [
        { category: { $in: recommendedCategories } },
        { description: { $in: recommendedSearchQueries } },
      ],
    });

    // Sort the products based on relevance or other criteria (optional)
    recommendedProducts.sort((a, b) => b.relevanceScore - a.relevanceScore);

    res.status(200).json(recommendedProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching recommendations." });
  }
};

export const clearUserTracks = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Delete all user tracks (category clicks, search queries)
    await recommendationModel.deleteMany({ userId });

    res.status(200).json({ message: "User tracks cleared successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error clearing user tracks." });
  }
};
