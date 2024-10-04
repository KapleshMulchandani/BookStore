const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 1: Get the book list available in the shop
public_users.get('/', async (req, res) => {
  try {
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving book list." });
  }
});

// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  const { isbn } = req.params;
  const book = books[isbn];
  
  if (book) {
    res.status(200).json(book);
  } else {
    res.status(404).json({ message: "Book not found." });
  }
});

// Task 3: Get book details based on author
public_users.get('/author/:author', async (req, res) => {
  const { author } = req.params;
  const filteredBooks = Object.values(books).filter(book => book.author.toLowerCase() === author.toLowerCase());

  if (filteredBooks.length) {
    res.status(200).json(filteredBooks);
  } else {
    res.status(404).json({ message: "No books found for this author." });
  }
});

// Task 4: Get all books based on title
public_users.get('/title/:title', async (req, res) => {
  const { title } = req.params;
  const filteredBooks = Object.values(books).filter(book => book.title.toLowerCase().includes(title.toLowerCase()));

  if (filteredBooks.length) {
    res.status(200).json(filteredBooks);
  } else {
    res.status(404).json({ message: "No books found with this title." });
  }
});

// Task 5: Get book review
public_users.get('/review/:isbn', async (req, res) => {
  const { isbn } = req.params;
  const book = books[isbn];
  
  if (book) {
    res.status(200).json(book.reviews);
  } else {
    res.status(404).json({ message: "Book not found." });
  }
});

// Task 6: Register New user
public_users.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (isValid(username) && !users.some(user => user.username === username)) {
    users.push({ username, password });
    res.status(201).json({ message: "User registered successfully." });
  } else {
    res.status(400).json({ message: "Invalid username or user already exists." });
  }
});

// Task 7: Login as a Registered user
public_users.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(user => user.username === username && user.password === password);

  if (user) {
    req.session.user = user;
    res.status(200).json({ message: "Login successful." });
  } else {
    res.status(401).json({ message: "Invalid username or password." });
  }
});

// Task 8: Add/Modify a book review
public_users.put("/auth/review/:isbn", async (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;

  if (req.session.user) {
    if (books[isbn]) {
      books[isbn].reviews[req.session.user.username] = review;
      res.status(200).json({ message: "Review added/modified successfully." });
    } else {
      res.status(404).json({ message: "Book not found." });
    }
  } else {
    res.status(403).json({ message: "User not authenticated." });
  }
});

// Task 9: Delete book review added by that particular user
public_users.delete("/auth/review/:isbn", async (req, res) => {
  const { isbn } = req.params;

  if (req.session.user) {
    if (books[isbn] && books[isbn].reviews[req.session.user.username]) {
      delete books[isbn].reviews[req.session.user.username];
      res.status(200).json({ message: "Review deleted successfully." });
    } else {
      res.status(404).json({ message: "Book not found or review does not exist." });
    }
  } else {
    res.status(403).json({ message: "User not authenticated." });
  }
});

// Export the public_users router
module.exports.general = public_users;
