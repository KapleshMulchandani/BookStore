const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if the username is valid (not empty and at least 3 characters long)
const isValid = (username) => {
    return username && username.length >= 3; // Example validation criteria
};

// Check if username and password match the ones we have in records
const authenticatedUser = (username, password) => {
    const user = users.find(user => user.username === username);
    return user && user.password === password;
};

// Only registered users can log in
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!authenticatedUser(username, password)) {
        return res.status(400).json({ message: "Invalid username or password." });
    }

    // Generate a token (optional)
    const token = jwt.sign({ username }, 'your_secret_key', { expiresIn: '1h' });
    return res.status(200).json({ message: "Login successful", token });
});

// Register New User
regd_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    // Validate the username
    if (!isValid(username)) {
        return res.status(400).json({ message: "Invalid username." });
    }

    // Check if user already exists
    if (users.find(user => user.username === username)) {
        return res.status(400).json({ message: "User already exists." });
    }

    // Add new user
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully." });
});

// Add/Modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;
    const username = req.body.username; // Assume this is passed in request

    // Check if the book exists
    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found." });
    }

    // Add/modify the review
    if (!book.reviews[username]) {
        book.reviews[username] = review; // Add new review
    } else {
        book.reviews[username] = review; // Modify existing review
    }

    return res.status(200).json({ message: "Review added/modified successfully.", reviews: book.reviews });
});

// Export the router and utility functions
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
