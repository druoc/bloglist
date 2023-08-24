require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const { infoLogger, errorLogger } = require("./utils/logger");
const { PORT, MONGODB_URI } = require("./utils/config");

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
});

const Blog = mongoose.model("Blog", blogSchema);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    infoLogger("connected to MongoDB");
  })
  .catch((error) => {
    infoLogger("error connecting to MongoDB", error.message);
  });

app.use(cors());
app.use(express.json());

app.get("/api/blogs", (request, response) => {
  Blog.find({}).then((blogs) => {
    response.json(blogs);
  });
});

app.post("/api/blogs", (request, response) => {
  const blog = new Blog(request.body);

  blog.save().then((result) => {
    response.status(201).json(result);
  });
});

app.listen(PORT, () => {
  infoLogger(`Server running on port ${PORT}`);
});
