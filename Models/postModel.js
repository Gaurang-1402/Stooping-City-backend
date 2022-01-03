import mongoose from "mongoose"

// special object in mongoose schema we need
// it later I'll explain
const { ObjectId } = mongoose.Schema

const postSchema = new mongoose.Schema(
  {
    postContent: {
      type: {},
      required: true,
    },
    postedBy: {
      // this type and ref combo allows us
      // to refer to a different User Schema
      type: ObjectId,
      ref: "User",
    },
    // image can be uploaded in posts- we use a seperate
    // service where the image is uploaded
    // and in return we get a string to be saved as a url
    image: {
      url: String,
      public_id: String,
    },

    likes: [{ type: ObjectId, ref: "User" }],
    comments: [
      {
        text: String,
        created: { type: Date, default: Date.now },
        postedBy: {
          type: ObjectId,
          ref: "User",
        },
      },
    ],
  },
  { timestamps: true }
)
const Post = mongoose.model("Post", postSchema)
export default Post
