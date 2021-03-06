import express from "express"
const {
  createPostController,
  uploadImageController,
  getPostsController,
  userPostController,
  updatePostController,
  deletePostController,
  newsFeedController,
  likePostController,
  unLikePostController,
  addCommentController,
  removeCommentController,
  allPostsController,
  getHomePostsController,
  getPostController,
} = require("../Controllers/postControllers")

import { canEditDeletePost } from "../Middlewares/canEditDeletePost"

const router = express.Router()

// middlewares
import { authMiddleware } from "../Middlewares/authMiddleware"
// npm i express-formidable
// used as middleware to decipher the form data we are getting
import formidable from "express-formidable"

router.post("/create-post", authMiddleware, createPostController)

// formidable middleware applied
router.post(
  "/upload-image",
  authMiddleware,
  formidable({ maxFileSize: 5 * 1024 * 1024 }),
  uploadImageController
)

router.get("/user-posts", authMiddleware, getPostsController)

router.get("/user-post/:_id", authMiddleware, userPostController)

// new middleware to verify if the post being requested is owned by the current user
router.put(
  "/update-post/:id",
  authMiddleware,
  canEditDeletePost,
  updatePostController
)

router.delete(
  "/delete-post/:id",
  authMiddleware,
  canEditDeletePost,
  deletePostController
)

router.get("/news-feed/:page", authMiddleware, newsFeedController)

router.put("/like-post", authMiddleware, likePostController)
router.put("/unlike-post", authMiddleware, unLikePostController)

router.put("/add-comment", authMiddleware, addCommentController)
router.put("/remove-comment", authMiddleware, removeCommentController)

router.get("/all-posts", allPostsController)
router.get("/home-posts", getHomePostsController)

router.get("/post/:_id", getPostController)

module.exports = router
