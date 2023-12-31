const bcrypt = require("bcrypt");
const userRouter = require("express").Router();
const User = require("../models/user");

userRouter.post("/", async (req, res) => {
  const { username, name, password } = req.body;
  if (!username || username.length < 3) {
    return res.status(400).json({ error: "a username is required" });
  }

  if (!password || password.length < 3) {
    return res.status(400).json({ error: "a password is required" });
  }
  //password salting
  const passwordHash = await bcrypt.hash(password, 10);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await user.save();
  res.status(201).json(savedUser);
});

module.exports = userRouter;
