import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import fs from "fs"
require("dotenv").config()
const colors = require("colors")

// allows you to use dotenv values

// the esp import syntax doesn't work with morgan and dotenv
const morgan = require("morgan")

// give app all the express functionality required
const app = express()
// for socket.io
const http = require("http").createServer(app)
// after npm i socket.io
// format in params is (http, {configuration})
const io = require("socket.io")(http, {
  // cors configuration needed
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-type"],
  },
  cors: {
    origin: process.env.LOCAL_CLIENT_URL,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-type"],
  },
})

// specifying morgan log format type dev- middleware
app.use(morgan("dev"))

// this is boiler plate code to connect to mongodb
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("DB connected".yellow))
  .catch((err) => console.log("DB connection error => ".red, err))

// if you don't do this, the json payload will appear unndefined because
// javascript doesn't like json from requests' data coming from client
// middleware
app.use(express.json())

// this is to send payload to client this helps in sending it- middleware
app.use(express.urlencoded({ extended: true }))

// allows you to make requests to and from localhost:3000 to 8000
app.use(
  cors({ origin: [process.env.CLIENT_URL, process.env.LOCAL_CLIENT_URL] })
)

// trial post request, first param is the route path
// second is a callback function also called controller that always has
// req, res as params and we can get the data payload from req.params
// app.post("/api/register", (req, res) => {
//   console.log("Data received at register endpoint => ".blue, req.body)
// })

fs.readdirSync("./Routes").map((route) =>
  app.use("/api", require(`./Routes/${route}`))
)

// socket.io
// io.on(eventName, callback function)
io.on("connect", (socket) => {
  socket.on("new-post", (newPost) => {
    socket.broadcast.emit("new-post", newPost)
  })
})

const port = process.env.PORT || 7000

http.listen(port, () => {
  console.log(`Server started on port ${port}`.white)
})
