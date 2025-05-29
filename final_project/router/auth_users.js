const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  return !users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
  return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password." });
  }
  const accessToken = jwt.sign({ username }, "access_secret", { expiresIn: "1h" });
  req.session.authorization = { accessToken, username };
  return res.status(200).json({ message: "User successfully logged in", token: accessToken });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authenticated?.username;
  if (!username) {
    res.send("You need to be logged in to post a review.");
  }
  if (!books[isbn]) {
    res.send("No such book exists!");
  }
  res.send("Review added/updated!");
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.query.isbn;
    const username = req.session.authenticated?.username;

    if (!username){
        res.send("you need to be looged in to post a review.");
    }
    if (!books[isbn] || !books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.send("Review not found.");
    }
    delete books[isbn].reviews[username];
    res.send("Review(s) deleted succesfully.");
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
