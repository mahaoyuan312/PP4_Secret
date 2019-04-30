//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

//configure and initialize passport
app.use(session({
  secret: "This is a secret.",
  resave: false,
  saveUninitialized: false
}));

//use the packages
app.use(passport.initialize());
app.use(passport.session());


//connect to the default local port of the mongodb
mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true
});

//fix the warning in the console
mongoose.set("useCreateIndex", true);
//get and response posts sent from html files of different pages
app.get("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req, res) {
  res.render("login");

});

app.get("/submit", function(req,res){
  if (req.isAuthenticated()) {
    res.render("submit");
  } else {
    res.redirect("/login");
  }
});
app.get("/register", function(req, res) {
  res.render("register");
});
app.get("/auth/google",
  passport.authenticate('google', {
    scope: ["profile"]
  }));

app.get("/auth/google/secrets",
  passport.authenticate("google", {
    failureRedirect: "/login"
  }),
  function(req, res) {
    // Successful authentication, redirect Secrets page.
    res.redirect("/secrets");
  });

app.get("/secrets", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

//Schema for the user, pretty much like a structure for object
//create the schema by using mongoose.Schema provides more feature
//has to be a mongoose schema to use the plugin
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String
});

//use to hash in salt user information and save to mongoDB database
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


//create a user model using the schema above
const User = new mongoose.model("User", userSchema);

//authenticate user to use userid and password
passport.use(User.createStrategy());
//create a user login createStrategy:
//serializeUser: store user info ; deserializeUser: get user info
//change to passport serializeUser so it works only for local but for all Strategies
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  }, //accessToken: token sent back from google that allow us to get data related to users
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({
      googleId: profile.id
    }, function(err, user) {
      return cb(err, user);
    });
  }
));
/*use passport.authenticate allow user to redirect to the page need authentication
without need to enter password again and again */
app.post("/register", function(req, res) {
  User.register({
    username: req.body.username
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("secrets");
      });
    }
  });
});


//render secret page - login
app.post("/login", function(req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password

  });
  //use the passport login function
  req.login(user, function(err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/secrets");
      });
    }
  });
});

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});
//start server
app.listen(3000, function() {
  console.log("Server started on port:3000");

});
