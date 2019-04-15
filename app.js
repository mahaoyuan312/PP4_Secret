//jshint esversion:6
const express = require ("express");
const bodyParser = require ("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
//connect to the default local port of the mongodb
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});
//Schema for the user, pretty much like a structure for object
const userSchema = {
 emial : String,
 password:String
};

//create a user using the schema above
const User = new mongoose.model("User", userSchema);


app.get("/",function(req, res)
{
  res.render("home");
});

app.get("/login",function(req, res) {
  res.render("login");

});

app.get("/register", function(req, res){
  res.render("register");
});

app.post("/register", function(req, res){
  const newUser = new User({
    email: req.body.username,
    password:req.body.password
  });
  newUser.save(function (err) {
    if (err) {
      console.log(err);
    }else {
      //we want to render the secretes page until the user has entered the Username and Password
      res.render("secrets");
    }

  });
});

app.listen(3000, function(){
console.log("Server started on port:3000");

});
