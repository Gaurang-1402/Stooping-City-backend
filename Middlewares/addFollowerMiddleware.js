import User from "../Models/userModel"
// npm i jsonwebtoken

export const addFollowerMiddleware = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.body._id,
      {
        $addToSet: { followers: req.user._id },
      },
      { new: true }
    )
    next()
  } catch (err) {
    console.log(err)
  }
}
