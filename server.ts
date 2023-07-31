require("dotenv").config()
import express, { Response, Request, NextFunction } from "express"
import mongoose, { ConnectOptions } from "mongoose"
import cookieParser from "cookie-parser"
import cors from "cors"
import socketController from "./controller/socketController"

const app = express()
const http = require("http").Server(app)
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
})

app.use(express.json())
app.use(
  cors({
    credentials: true,
    origin: "*",
  })
)
app.use(cookieParser())

mongoose.connect(process.env.MONGODB_URI!, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as ConnectOptions)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) =>
    console.error("Failed to connect to MongoDB", error.message)
  )

app.get("/", (req, res) => {
  return res.send("Server running!")
})

// Web Sockets
io.on("connection", socketController)

io.on("disconnect", () => {
  console.log("User disconnected")
})

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.message)

  res.status(500).json({ message: err.message })
})

// Start the server
const port = process.env.PORT || 4001
http.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
})
