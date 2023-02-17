var express = require("express");
var app = express();
var path = require("path");

// __dirname will use the current path from where you run this file
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, "/callIndex.html")));

app.listen(8000, () => {
  require("child_process").exec("start http://localhost:8000/callIndex.html");
  console.log("Listening on port 8000");
});
