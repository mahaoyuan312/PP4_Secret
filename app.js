//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
//const md5 = require("md5");
//const encrypt = require("mongoose-encryption");
const bcrypt = require("bcrypt");
const app = express();
//console.log(process.env.API_KEY);
//console.log(md5(1234));
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
//connect to the default local port of the mongodb
mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true
});

//get and response posts sent from html files of different pages
app.get("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req, res) {
  res.render("login");

});

app.get("/register", function(req, res) {
  res.render("register");
});

//Schema for the user, pretty much like a structure for object
//create the schema by using mongoose.Schema provides more feature
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});


//add user schema plugin for the environment variable encryption key
//userSchema.plugin(encrypt, {secret:process.env.SECRET, encryptedFields: ["password"]});

//create a user model using the schema above
const User = new mongoose.model("User", userSchema);

//render secret page  - register
app.post("/register", function(req, res) {
  bcrypt.hash(req.body.password, 10, function(err, hash) {
    const newUser = new User({
      email: req.body.username,
      password: hash
    });
    //save the new user to the database
    newUser.save(function(err) {
      if (err) {
        console.log(err);
      } else {
        //we want to render the secretes page until the user has entered the Username and Password
        res.render("secrets");
      }

    });
  });

});

//reder secret page - login
app.post("/login", function(req, res) {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({
      email: username
    },
    function(err, foundUser) {
      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          // Load hash from password DB.
          bcrypt.compare(password, foundUser.password, function(err, result) {
            if (result) {
              res.render("secrets");
            }
          });
        }
      }
    });

});

app.listen(3000, function() {
  console.log("Server started on port:3000");

});
