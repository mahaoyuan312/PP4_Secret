//jshint esversion:6
const express = require ("express");
const bodyParser = require ("body-parser");
const ejs = require("ejs");
const mooose = require("mongoose");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});
