import express from "express"
const {
  registerController,
  loginController,
  currentUser,
  forgotPasswordController,
  updateUserController,
  findPeopleController,
} = require("../Controllers/authControllers")
const router = express.Router()

// middlewares
import { authMiddleware } from "../Middlewares/authMiddleware"

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

module.exports = router
