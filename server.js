const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

require('dotenv').config();

const port = process.env.PORT || 8080;

const app = express();

app.use(express.static(__dirname + "/public"));
app.use("/uploads", express.static(__dirname + "/uploads"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(require('./app/routes'));

app.set('view engine', 'ejs')

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

app.listen(port);
console.log("The server is running on port " + port);

module.exports = app