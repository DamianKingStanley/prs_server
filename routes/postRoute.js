import express from "express";
import upload from "../multer.js";

const router = express.Router();

import {
  createPost,
  fetchAllPost,
  searchProducts,
  fetchFilteredPosts,
  getPostsByCategory,
  likePost,
  savePost,
  dummylikePost,
  dummysavePost,
  searchgoogleBook,
  fetchGoogleBook,
  searchPosts,
  editPost,
  deletePost,
  getSinglePost,
  getPostsByUser,
  postCount,
} from "../controllers/postController.js";

import auth from "../middleware/auth.js";

router.post("/post/upload-product", auth, upload.single("image"), createPost);
router.get("/posts", fetchAllPost);
router.get("/products/search", searchProducts);
router.get("/posts/category/:category", getPostsByCategory);
router.get("/filtered-posts", fetchFilteredPosts);
router.get("/:category", getPostsByCategory);
router.put("/posts/:postId/like", likePost);
router.put("/posts/:postId/save", savePost);
router.put("/dummy/like", dummylikePost);
router.put("/dummy/save", dummysavePost);
router.get("/googlebook/search", searchgoogleBook);
router.get("/googlebook/search", searchgoogleBook);
router.get("/googlebook/fetch", fetchGoogleBook);
router.get("/book/search", searchPosts);
router.get("/posts/count", postCount);
router.put("/posts/edit/:id", auth, editPost);
router.delete("/posts/edit/:id", auth, deletePost);
router.get("/post/:id", getSinglePost);
router.get("/posts/:userId", getPostsByUser);

export default router;
