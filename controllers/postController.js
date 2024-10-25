import postModel from "../models/post.js";
import userModel from "../models/user.js";
import multer from "multer";
import axios from "axios";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

dotenv.config();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage: storage });

// Create Post Function
export const createPost = async (req, res) => {
  try {
    const { userId, category, title, price, description } = req.body;

    // Handle file upload
    const image = req.file ? `uploads/${req.file.filename}` : null;

    if (!image) {
      return res.status(400).json({ error: "Cover picture is required." });
    }

    // Create a new post
    const newPost = await postModel.create({
      userId,
      category,
      title,
      price,
      description,
      image,
    });

    res.status(200).json({ message: "Post created successfully.", newPost });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//Filtered Posts

// Fetch Filtered Posts
export const fetchFilteredPosts = async (req, res) => {
  try {
    const { category, priceRange, title, sortBy } = req.query;

    // Build the query object based on available filters
    const query = {};

    // Add category filter if available
    if (category) query.category = category;

    // Filter by title if provided (case-insensitive search)
    if (title) query.title = { $regex: title, $options: "i" };

    // Filter by price range if provided
    if (priceRange) {
      const [minPrice, maxPrice] = priceRange.split("-");
      query.price = { $gte: Number(minPrice), $lte: Number(maxPrice) };
    }

    // Execute the query with optional sorting
    const fetchPosts = await postModel
      .find(query)
      .sort(sortBy ? { [sortBy]: 1 } : {})
      .populate("userId", "username");

    res
      .status(200)
      .json({ message: "Posts retrieved successfully", fetchPosts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPostsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    // Check if the category exists
    const validCategories = [
      "footwear",
      "clothes",
      "gadgets",
      "makeup",
      "electronics",
      "appliances",
      "cap",
      "female-wear",
    ];

    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid category." });
    }

    // Find posts that match the category
    const posts = await postModel
      .find({ category })
      .populate("userId", "username");

    res.status(200).json({ message: "Posts retrieved successfully", posts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// fetch all post
export const fetchAllPost = async (req, res) => {
  try {
    const fetchPosts = await postModel.find({}).populate("userId", "username");
    res.status(200).json({ message: "successful", fetchPosts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search for products
export const searchProducts = async (req, res) => {
  try {
    const query = req.query.query;
    if (!query) {
      return res.status(400).json({ message: "Search query is required." });
    }

    // Modify the search logic to match your database fields
    const products = await postModel.find({
      $or: [
        { title: { $regex: query, $options: "i" } }, // Case-insensitive search for product name
        { category: { $regex: query, $options: "i" } }, // Case-insensitive search for category
      ],
    });

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found." });
    }

    res.status(200).json({ message: "Search successful", products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Search Google book
const googleBooksApiKey = process.env.GOOGLE_BOOKS_API_KEY;

const fetchBooksFromGoogle = async (query) => {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&key=${googleBooksApiKey}`;
  return await axios.get(url);
};

export const searchgoogleBook = async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }
  try {
    const response = await fetchBooksFromGoogle(query);
    res.json(response.data.items);
  } catch (error) {
    console.error("Error fetching data from Google Books API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Fetch all Google Books with a default query
export const fetchGoogleBook = async (req, res) => {
  try {
    const response = await fetchBooksFromGoogle("textbook");
    res.json(response.data.items);
  } catch (error) {
    console.error("Error fetching data from Google Books API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//SEARCH BY TILTLE
export const searchPosts = async (req, res) => {
  try {
    const { title } = req.query;

    if (!title) {
      return res
        .status(400)
        .json({ message: "Title query parameter is required" });
    }

    const posts = await postModel.find({
      title: { $regex: title, $options: "i" }, // Case-insensitive search
    });

    if (posts.length === 0) {
      return res.status(404).json({ message: "No books found" });
    }

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const postCount = async (req, res) => {
  try {
    const postCount = await postModel.countDocuments();
    res.status(200).json({ count: postCount });
  } catch (error) {
    console.error("Error fetching post count:", error);
    res.status(500).json({ message: error.message });
  }
};

// edit post
export const editPost = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(req.body);
    const updatePosts = await postModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    console.log(updatePosts);
    res.status(200).json({ message: "Updated succesfully", updatePosts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// delete post
export const deletePost = async (req, res) => {
  try {
    const id = req.params.id;
    await postModel.findByIdAndRemove(id);

    res.status(200).json({ message: "deleted succesfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// single post
export const getSinglePost = async (req, res) => {
  try {
    const id = req.params.id;
    const SinglePost = await postModel.findById(id);
    console.log(SinglePost);
    res.status(200).json({ message: "Fetch succesfully", SinglePost });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// posts by a user
export const getPostsByUser = async (req, res) => {
  try {
    const userId = req.query.userId;
    const posts = await postModel.find({ userId: userId });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Track post like
export const likePost = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const postId = req.params.postId;
    const post = await postModel.findById(postId);
    const user = await userModel.findById(userId); // Fetch the user to update liked posts

    if (!post || !user) {
      return res.status(404).json({ message: "Post or user not found." });
    }

    // Check if the user already liked the post
    const hasLiked = user.likedPosts.includes(postId);

    if (hasLiked) {
      // If already liked, remove the like (unlike)
      user.likedPosts = user.likedPosts.filter(
        (likedPost) => likedPost.toString() !== postId
      );
      post.likes = post.likes.filter((like) => like.toString() !== userId); // Ensure post.likes array is updated

      await Promise.all([user.save(), post.save()]);
      return res.status(200).json({ message: "Like removed." });
    } else {
      // Otherwise, add the like
      user.likedPosts.push(postId); // Add to the user's liked posts
      post.likes.push(userId); // Add to the post's likes

      await Promise.all([user.save(), post.save()]);
      return res.status(200).json({ message: "Post liked." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error processing like." });
  }
};

// Track post save
export const savePost = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const postId = req.params.postId;
    const post = await postModel.findById(postId);
    const user = await userModel.findById(userId); // Fetch the user to update saved posts

    if (!post || !user) {
      return res.status(404).json({ message: "Post or user not found." });
    }

    // Check if the user already saved the post
    const hasSaved = user.savedPosts.includes(postId);

    if (hasSaved) {
      // If already saved, remove the save
      user.savedPosts = user.savedPosts.filter(
        (savedPost) => savedPost.toString() !== postId
      );
      post.saves = post.saves.filter((save) => save.toString() !== userId); // Ensure post.saves array is updated

      await Promise.all([user.save(), post.save()]);
      return res.status(200).json({ message: "Save removed." });
    } else {
      // Otherwise, add the save
      user.savedPosts.push(postId); // Add to the user's saved posts
      post.saves.push(userId); // Add to the post's saves

      await Promise.all([user.save(), post.save()]);
      return res.status(200).json({ message: "Post saved." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error processing save." });
  }
};

export const dummylikePost = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    // Check if productId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    // Find the user by userId
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure likedPosts is an array
    if (!Array.isArray(user.likedPosts)) {
      user.likedPosts = [];
    }

    // Convert productId to ObjectId using 'new'
    const productIdObjectId = new mongoose.Types.ObjectId(productId);

    // Check if the product is already liked
    if (user.likedPosts.some((id) => id.equals(productIdObjectId))) {
      // Unlike the product
      user.likedPosts = user.likedPosts.filter(
        (id) => !id.equals(productIdObjectId)
      );
      await user.save(); // Save the user after unliking
      return res.status(200).json({ message: "Product unliked" });
    } else {
      // Like the product
      user.likedPosts.push(productIdObjectId);
      await user.save(); // Save the user after liking
      return res.status(200).json({ message: "Product liked" });
    }
  } catch (error) {
    console.error("Error liking/unliking product:", error);
    return res.status(500).json({ message: "Error liking/unliking product" });
  }
};
// Track post save
export const dummysavePost = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    // Check if productId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    // Find the user by userId
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure savedPosts is an array
    if (!Array.isArray(user.savedPosts)) {
      user.savedPosts = [];
    }

    // Convert productId to ObjectId using 'new'
    const productIdObjectId = new mongoose.Types.ObjectId(productId);

    if (user.savedPosts.some((id) => id.equals(productIdObjectId))) {
      // If the product is already saved, unsave it
      user.savedPosts = user.savedPosts.filter(
        (id) => !id.equals(productIdObjectId)
      );
      await user.save(); // Save the user after unsaving
      return res.status(200).json({ message: "Product unsaved" });
    } else {
      // Otherwise, save it
      user.savedPosts.push(productIdObjectId);
      await user.save(); // Save the user after saving
      return res.status(200).json({ message: "Product saved" });
    }
  } catch (error) {
    console.error("Error saving product:", error);
    return res.status(500).json({ message: "Error saving product" });
  }
};
