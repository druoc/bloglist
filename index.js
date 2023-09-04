const express = require("express");
require("express-async-errors");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const { infoLogger, errorLogger } = require("./utils/logger");
const { PORT, MONGODB_URI } = require("./utils/config");
const blogsRouter = require("./controllers/blogs");
const userRouter = require("./controllers/users");

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    infoLogger("connected to MongoDB");
  })
  .catch((error) => {
    infoLogger("error connecting to MongoDB");
    errorLogger(error.message);
  });

app.use(cors());
app.use(express.json());

app.use("/api/blogs", blogsRouter);
app.use("/api/users", userRouter);

app.listen(PORT, () => {
  infoLogger(`Server running on port ${PORT}`);
});

module.exports = app;
