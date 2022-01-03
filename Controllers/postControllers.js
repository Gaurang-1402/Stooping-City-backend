import Post from "../Models/postModel"
import cloudinary from "cloudinary"
import { ChildProcess } from "child_process"

exports.createPostController = async (req, res) => {
  const { postContent, image } = req.body

  if (!postContent.length) {
    return res.json({ error: "Please add some content before posting" })
  }

  try {
    const newPost = new Post({
      postContent: postContent,
      postedBy: req.user._id,
      image: image,
    })

    newPost.save()
    return res.json(newPost)
  } catch (err) {
    return res.json({ error: "Something went wrong" })
  }
}

// cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
})

export const uploadImageController = async (req, res) => {
  // console.log("req files => ", req.files);
  try {
    const result = await cloudinary.uploader.upload(req.files.image.path)
    // console.log("uploaded image url => ", result);
    res.json({
      url: result.secure_url,
      public_id: result.public_id,
    })
  } catch (err) {
    console.log(err)
  }
}

export const getPostsController = async (req, res) => {
  try {
    // we find, sort, and then populate based on the user that is logged in
    const posts = await Post.find()
      .populate("postedBy", "_id firstName lastName image")
      .sort({ createdAt: -1 })
      .limit(10)
    console.log(posts)

    res.json(posts)
  } catch (err) {}
}

export const userPostController = async (req, res) => {
  try {
    const post = await Post.findById(req.params._id)
  } catch (err) {}
}
