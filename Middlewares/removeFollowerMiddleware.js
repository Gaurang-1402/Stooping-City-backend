import User from "../Models/userModel"

export const removeFollowerMiddleware = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.body._id, {
      $pull: { followers: req.user._id },
    })
    next()
  } catch (err) {
    console.log(err)
  }
}
