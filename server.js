import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import fs from "fs"

const colors = require("colors")

// allows you to use dotenv values
require("dotenv").config()

// the esp import syntax doesn't work with morgan and dotenv
const morgan = require("morgan")

// give app all the express functionality required
const app = express()

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
app.use(cors({ origin: ["http://localhost:3000"] }))

// trial post request, first param is the route path
// second is a callback function also called controller that always has
// req, res as params and we can get the data payload from req.params
// app.post("/api/register", (req, res) => {
//   console.log("Data received at register endpoint => ".blue, req.body)
// })

fs.readdirSync("./Routes").map((route) =>
  app.use("/api", require(`./Routes/${route}`))
)

const port = process.env.PORT || 7000

app.listen(port, () => {
  console.log(`Server started on port ${port}`.white)
})