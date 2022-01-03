import { comparePassword, hashPassword } from "../Helpers/bcryptHash"
import User from "../Models/userModel"
// npm i jsonwebtoken
import jwt from "jsonwebtoken"

exports.registerController = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    age,
    gender,
    secret,
  } = req.body

  // validation

  if (!firstName || !lastName)
    return res.json({ error: "Please provide your first name and last name" })

  if (!age) return res.json({ error: "Please enter your age" })

  const isEmailExist = await User.findOne({ email })

  if (isEmailExist)
    return res.json({ error: "This email is already in use. Please login" })

  if (!password || password.length < 6)
    return res.json({
      error: "Please provide a password with more than 6 characters",
    })

  if (password !== confirmPassword)
    return res.json({
      error: "The passwords do not match",
    })
  const hashedPassword = await hashPassword(password)

  if (!secret)
    return res.json({
      error: "Please enter an answer to the security question",
    })

  const newUser = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    age,
    gender,
    secret,
  })

  try {
    await newUser.save()
    return res.json({
      ok: true,
      success: "You have successfully been registered. Please login",
    })
  } catch (err) {
    return res.json({
      error: "There was an error, please try again",
    })
  }
}

exports.loginController = async (req, res) => {
  try {
    const { email, password } = req.body

    /// validation

    // since email is unique, we can query in the DB using email to find the user
    // object associated with that email
    const user = await User.findOne({ email })
    if (!user) {
      return res.json({
        error: "Email not found. Please check your email or sign up.",
      })
    }

    // we know that the password in DB is hashed, we can unhash and check if
    // the password we find through
    const isPasswordMatch = await comparePassword(password, user.password)

    if (!isPasswordMatch) {
      return res.json({
        error: "Password is incorrect",
      })
    }

    /// jwt.sign() gives us a token back the params are
    /// jwt.sign({<the fields that we need to save in token>}, <JWT secret we stored>, <how long till the token expires>)
    /// _id is auto generated by MongoDB

    const jwtToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    })

    // we are gonna send user and we don't want client to have
    // the ability to modify passwords and secret
    user.password = undefined
    user.secret = undefined

    // send jwt token and the user object to client
    return res.json({
      success: "Logged in successfully",
      token: jwtToken,
      user,
    })
  } catch (err) {
    console.log(err)
    return res.json({ error: "An error occurred, please try again." })
  }
}

exports.currentUser = async (req, res) => {
  try {
    // beecause of the middleware in the route, we can see the extracted
    // information in the JSON web token
    // console.log(req.user)

    const user = await User.findById(req.user._id)
    return res.json({
      ok: true,
    })
  } catch (err) {
    console.log(err)
    return res.sendStatus(400)
  }
}

exports.forgotPasswordController = async (req, res) => {
  const { email, newPassword, confirmNewPassword, secret } = req.body
  if (!newPassword || newPassword.length < 6) {
    return res.json({
      error: "Please enter a new password that is at least 6 characters long",
    })
  }

  if (newPassword !== confirmNewPassword) {
    return res.json({
      error: "The passwords do not match. Please check again",
    })
  }

  const user = await User.findOne({ email, secret })

  if (!user) {
    return res.json({ error: "We can't verify those details" })
  }

  try {
    const hashedNewPassword = await hashedPassword(newPassword)

    User.findByIdAndUpdate(user._id, { password: hashedNewPassword })

    return res.json({
      success:
        "Password successfully changed. Please login with your new password.",
    })
  } catch (err) {
    console.log(err)
    return res.json({ error: "Something went wrong. Try again." })
  }
}
