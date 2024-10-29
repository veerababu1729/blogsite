const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = 5000;
const MONGO_URL = "mongodb+srv://veerababupalepu239:WE8YCfCxmUIjtkc5@expensetrackercluster.fbfva.mongodb.net/?retryWrites=true&w=majority&appName=expensetrackercluster"; // Replace with your MongoDB URL if using MongoDB Atlas

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Connection
mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage: storage });

// Define Blog Post Schema and Model
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  image: String, // New field for image
  createdAt: { type: Date, default: Date.now }
});

const Post = mongoose.model("Post", postSchema);

// Routes
app.get("/posts", async (req, res) => {
  const posts = await Post.find();
  res.json(posts);
});

app.post("/posts", upload.single("image"), async (req, res) => {
  const { title, content, author } = req.body;
  const image = req.file ? req.file.filename : null;

  const newPost = new Post({
    title,
    content,
    author,
    image,
  });

  await newPost.save();
  res.json(newPost);
});

app.put("/posts/:id", async (req, res) => {
  const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedPost);
});

app.delete("/posts/:id", async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.json({ message: "Post deleted" });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
