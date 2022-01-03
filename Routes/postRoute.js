import express from "express"
const {
  createPostController,
  uploadImageController,
  getPostsController,
} = require("../Controllers/postControllers")

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

module.exports = router
