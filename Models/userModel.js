import mongoose from "mongoose"

// Schema is an object(class) in mongoose
const { Schema } = mongoose

// this is what the model looks like
const userSchema = new Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: true,
    },
    lastName: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      min: 6,
      max: 64,
    },
    username: {
      type: String,
      unique: true,
      required: true,
    },
    gender: {
      type: String,
    },
    age: {
      type: Number,
    },
    secret: {
      type: String,
    },
    about: {
      type: String,
    },
    role: {
      type: String,
      default: "Subscriber",
    },
    image: {
      url: String,
      public_id: String,
    },

    following: [{ type: Schema.ObjectId, ref: "User" }],
    followers: [{ type: Schema.ObjectId, ref: "User" }],
  },
  { timestamps: true }
)

// to activate schema, we use mongoose.model function with params
// reference of schema and the schema object itself
export default mongoose.model("User", userSchema)
