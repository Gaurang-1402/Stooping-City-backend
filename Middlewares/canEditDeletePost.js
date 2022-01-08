import Post from "../Models/postModel"

export const canEditDeletePost = async (req, res, next) => {
  try {
    console.log(req.params.id, req)
    const post = await Post.findById(req.params.id)
    // compare request id, with DB postedBy
    console.log("POST in EDITDELETE MIDDLEWARE => ", post)
    if (req.user._id != post.postedBy) {
      return res.status(400).send("Unauthorized")
    } else {
      next()
    }
  } catch (err) {
    console.log(err)
  }
}
