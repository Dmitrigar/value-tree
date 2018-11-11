const express = require("express");
const path = require("path");
const fs = require("fs");
const ValueTree = require("./ValueTree");

function sendFileContent(response, filePath) {
  fs.readFile(path.join(__dirname, filePath), (err, data) => {
    if (err) throw err;
    response.send(data.toString());
  });
}

// CONFIGURE EXPRESS APP
const app = express();
const port = 3000;

// Home page
app.get("/", (req, res) => {
  sendFileContent(res, "index.html");
});

// Value Tree script
app.get("/value-tree.js", (req, res) => {
  sendFileContent(res, "ValueTree.js");
});

app.listen(port);
