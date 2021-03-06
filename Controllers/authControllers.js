import { comparePassword, hashPassword } from "../Helpers/bcryptHash"
import User from "../Models/userModel"
// npm i jsonwebtoken
import jwt from "jsonwebtoken"
import { nanoid } from "nanoid"

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
    username: nanoid(6),
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

    // JWT_SECRET
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

exports.updateUserController = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      gender,
      age,
      username,
      password,
      confirmPassword,
      secret,
      about,
      image,
    } = req.body
    const data = {}
    if (firstName) {
      data.firstName = firstName
    }
    if (lastName) {
      data.lastName = lastName
    }
    if (gender) {
      data.gender = gender
    }
    if (age) {
      data.age = age
    }
    if (username) {
      data.username = username
    }

    if (image) {
      data.image = image
    }
    if (password) {
      if (password == confirmPassword) {
        if (password.length < 6) {
          return res.json({
            error: "Your password must be at least 6 characters long",
          })
        }
        data.password = await hashPassword(password)
      } else {
        return res.json({ error: "Your newly entered passwords do not match" })
      }
    }

    if (secret) {
      data.secret = secret
    }

    if (about) {
      data.about = about
    }
    let user = await User.findByIdAndUpdate(req.user._id, data, { new: true })

    user.password = undefined
    user.secret = undefined
    res.json(user)
  } catch (err) {
    if (err.code == 11000) {
      return res.json({ error: "Username is already taken" })
    }
    console.log(err)
  }
}

exports.findPeopleController = async (req, res) => {
  try {
    // console.log(req.user._id)
    const user = await User.findById(req.user._id)

    let following = user.following
    following.push(user._id)
    const people = await User.find({ _id: { $nin: following } }).limit(10)
    console.log(people)
    res.json(people)
  } catch (err) {
    console.log(err)
  }
}

exports.userFollowController = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $addToSet: { following: req.body._id },
      },
      { new: true }
    ).select("-password -secret")
    res.json(user)
  } catch (err) {
    console.log(err)
  }
}

exports.userFollowingController = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const following = await User.find({ _id: user.following }).limit(100)
    res.json(following)
  } catch (err) {
    console.log(err)
  }
}
exports.userUnfollowController = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: { following: req.body._id },
      },
      { new: true }
    )
    res.json(user)
  } catch (err) {
    console.log(err)
  }
}

export const searchUserController = async (req, res) => {
  const { query } = req.params
  if (!query) return
  try {
    // $regex is special method from mongodb
    // The i modifier is used to perform case-insensitive matching
    const user = await User.find({
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { username: { $regex: query, $options: "i" } },
      ],
    }).select("-password -secret")
    res.json(user)
  } catch (err) {
    console.log(err)
  }
}

export const getUserController = async (req, res) => {
  const { username } = req.params

  try {
    const user = await User.findOne({ username: username }).select(
      "-password -secret"
    )
    res.json(user)
  } catch (err) {
    console.log(err)
  }
}
