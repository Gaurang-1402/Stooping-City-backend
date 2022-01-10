import express from "express"
const {
  registerController,
  loginController,
  currentUser,
  forgotPasswordController,
  updateUserController,
  findPeopleController,
  userFollowController,
  userFollowingController,
  userUnfollowController,
} = require("../Controllers/authControllers")
const router = express.Router()

// middlewares
import { authMiddleware } from "../Middlewares/authMiddleware"

import { addFollowerMiddleware } from "../Middlewares/addFollowerMiddleware"

import { removeFollowerMiddleware } from "../Middlewares/removeFollowerMiddleware"

router.post("/register", registerController)
router.post("/login", loginController)

// now we have the json web token
// we don't want to manually verify the token
// so we use express=json-web-token
// applying a middleware
router.get("/current-user", authMiddleware, currentUser)

router.post("/forgot-password", forgotPasswordController)

router.put("/profile-update", authMiddleware, updateUserController)

router.get("/find-people", authMiddleware, findPeopleController)

router.put(
  "/user-follow",
  authMiddleware,
  addFollowerMiddleware,
  userFollowController
)

router.get("/user-following", authMiddleware, userFollowingController)

router.put(
  "/user-unfollow",
  authMiddleware,
  removeFollowerMiddleware,
  userUnfollowController
)

module.exports = router
