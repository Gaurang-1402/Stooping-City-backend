import Post from "../Models/postModel"
import cloudinary from "cloudinary"
import { ChildProcess } from "child_process"
import User from "../Models/userModel"

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
    // console.log(posts)

    res.json(posts)
  } catch (err) {}
}

export const userPostController = async (req, res) => {
  try {
    const post = await Post.findById(req.params._id)
    res.json(post)
  } catch (err) {
    console.log(err)
  }
}

export const updatePostController = async (req, res) => {
  try {
    // first param is the key by which we search second param is the new content
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // this enables you to get the new post
    })
    res.json(post)
  } catch (err) {
    console.log(err)
  }
}

export const deletePostController = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id)
    // we can delete the post from cloudinary
    // some posts may not have an image
    // console.log("DELETE POST", post)
    if (post.image.public_id) {
      const image = await cloudinary.uploader.destroy(post.image.public_id)
    }
    res.json({ ok: true })
  } catch (err) {
    console.log(err)
  }
}

export const newsFeedController = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    let following = user.following

    following.push(req.user._id)

    const posts = await Post.find({ postedBy: { $in: following } })
      .populate("postedBy", "_id firstName lastName image")
      .populate("comments.postedBy", "_id firstName lastName image")
      .sort({ createdAt: -1 })
      .limit(10)

    console.log("change ID now posts", posts)

    res.json(posts)
  } catch (err) {
    console.log(err)
  }
}

export const likePostController = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.body._id,
      // add to set adds ID to likes list
      { $addToSet: { likes: req.user._id } },
      { new: true }
    )
    res.json(post)
  } catch (err) {
    console.log(err)
  }
}

export const unLikePostController = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.body._id,
      // pull removes ID from likes list
      { $pull: { likes: req.user._id } },
      { new: true }
    )
    res.json(post)
  } catch (err) {
    console.log(err)
  }
}

export const addCommentController = async (req, res) => {
  try {
    const { postId, comment } = req.body

    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: { comments: { text: comment, postedBy: req.user._id } },
      },
      { new: true }
    )
      .populate("postedBy", "_id firstName lastName image")
      .populate("comments.postedBy", "_id firstName lastName image")
    res.json(post)
  } catch (err) {
    console.log(err)
  }
}

export const removeCommentController = async (req, res) => {
  try {
    const { postId, comment } = req.body

    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { comments: { _id: comment._id } },
      },
      { new: true }
    )
    res.json(post)
  } catch (err) {
    console.log(err)
  }
}
