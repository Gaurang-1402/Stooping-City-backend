import { comparePassword, hashPassword } from "../Helpers/bcryptHash"
import User from "../Models/userModel"

exports.authController = async (req, res) => {
  const { firstName, lastName, email, password, age, gender, secret } = req.body

  // validation

  if (!firstName || !lastName)
    return res.status(400).send("Please provide your first name and last name")

  if (!age) return res.status(400).send("Please enter your age")

  const isEmailExist = await User.findOne({ email })

  if (isEmailExist)
    return res.status(400).send("This email is already in use. Please login")

  if (!password || password.length < 6)
    return res
      .status(400)
      .send("Please provide a password with more than 6 characters")
  const hashedPassword = await hashPassword(password)

  if (!secret)
    return res
      .status(400)
      .send("Please enter an answer to the security question")

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
    return res.json({ ok: true })
    console.log("Registered User".green, savedUser)
  } catch (err) {
    return res.status(400).send("There was an error, please try again")
  }
}
