const { Mongoose, default: mongoose } = require("mongoose");

const userschema = new mongoose.Schema({
  Username: {
    type: String,
    required: true,
    unique: true,
  },
  Email: {
    type: String,
    required: true,
    unique: true,
  },
  Profile: {
    type: String,
    required: true,
  },
  Number: {
    type: Number,
    required: true,
    unique: true,
  },
  Password: {
    type: String,
    required: true,
    unique: true,
  },
  followers: {
    type: [],
  },
  following: {
    type: [],
  },
});

const postschema = mongoose.Schema({
  tittle: {
    type: String,
    required: true,
  },
  discription: {
    type: String,
    required: true,
  },
  auther: {
    type: [],
    required: true,
  },
  time: { type: Date, default: Date.now },
});
const User = mongoose.model("User", userschema);
const Post = mongoose.model("Post", postschema);
module.exports = { User, Post };
