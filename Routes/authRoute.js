import express from "express"
const { authController } = require("../Controllers/authControllers")
const router = express.Router()

router.post("/register", authController)

module.exports = router
