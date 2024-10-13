const express = require('express')
const jwt = require('jsonwebtoken')
let books = require('./booksdb.js')
const regd_users = express.Router()

let users = []

const authenticatedUser = (username, password) => {
  // Filter the users array for any user with the same username and password
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password
  })
  // Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
    return true
  } else {
    return false
  }
}

regd_users.post('/login', (req, res) => {
  const username = req.body.username
  const password = req.body.password
  // Check if username or password is missing
  if (!username || !password) {
    return res.status(404).json({ message: 'Error logging in' })
  }
  // Authenticate user
  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign(
      {
        data: password,
      },
      'access',
      { expiresIn: 60 * 60 }
    )
    // Store access token and username in session
    req.session.authorization = {
      accessToken,
      username,
    }
    return res.status(200).send('User successfully logged in')
  } else {
    return res.status(208).json({ message: 'Invalid Login. Check username and password' })
  }
})

regd_users.use('/auth/*', (req, res, next) => {
  if (req.session.authorization) {
    next()
  } else {
    res.status(401).json({ message: 'Unauthorized' })
  }
})

// Add a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn
  const review = req.body.review
  const username = req.session.authorization ? req.session.authorization.username : null

  if (!books[isbn]) {
    return res.status(404).send('Book not found')
  }

  let bookReviews = books[isbn].reviews

  bookReviews[username] = review // This will add or update the user's review

  return res.status(200).send(`Review for book '${books[isbn].title}' has been added/updated.`)
})

// Delete a book review
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn // Get ISBN from URL
  const username = req.session.authorization ? req.session.authorization.username : null // Get username from session

  // Check if the book with the given ISBN exists
  if (!books[isbn]) {
    return res.status(404).send('Book not found')
  }

  // Get the book's reviews
  let bookReviews = books[isbn].reviews

  // Check if the user has a review for this book
  if (!bookReviews[username]) {
    return res.status(400).send('You have not reviewed this book')
  }

  // Delete the user's review
  delete bookReviews[username]

  return res.status(200).send(`Your review for the book '${books[isbn].title}' has been deleted.`)
})

module.exports.authenticated = regd_users
module.exports.authenticatedUser = authenticatedUser
module.exports.users = users
