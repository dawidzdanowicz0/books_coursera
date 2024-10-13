const express = require('express')
let books = require('./booksdb.js')
let users = require('./auth_users.js').users
let authenticatedUser = require('./auth_users.js').authenticatedUser
const public_users = express.Router()

public_users.post('/register', (req, res) => {
  const username = req.body.username
  const password = req.body.password

  const doesExist = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
      return user.username === username
    })
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
      return true
    } else {
      return false
    }
  }

  // Check if both username and password are provided
  if (username && password) {
    if (!doesExist(username) && !authenticatedUser(username, password)) {
      // Add the new user to the users array
      users.push({ username: username, password: password })
      return res.status(200).json({ message: 'User successfully registered. Now you can login' })
    } else {
      return res.status(404).json({ message: 'User already exists!' })
    }
  }
  // Return error if username or password is missing
  return res.status(404).json({ message: 'Unable to register user.' })
})

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
  try {
    // Simulate an asynchronous operation, like reading data from a database
    const getBooks = async () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(books)
        }, 100) // Simulate a small delay for async behavior
      })
    }

    const booksData = await getBooks()
    res.send(JSON.stringify(booksData, null, 4))
  } catch (error) {
    res.status(500).send('Error fetching books')
  }
})

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const getBookByIsbn = (isbn) => {
    return new Promise((resolve, reject) => {
      const book = books[isbn]
      if (book) {
        resolve(book) // Resolve with the book data
      } else {
        reject('Book not found') // Reject if no book found for the given ISBN
      }
    })
  }

  const isbn = req.params.isbn

  getBookByIsbn(isbn)
    .then((book) => {
      res.send(book) // Send book data if resolved
    })
    .catch((error) => {
      res.status(404).send(error) // Send error if rejected
    })
})

// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
  try {
    const findBooksByAuthor = async (author) => {
      return new Promise((resolve, reject) => {
        const matchingBooks = Object.values(books).filter((book) => book.author.toLowerCase() === author.toLowerCase())

        if (matchingBooks.length > 0) {
          resolve(matchingBooks) // Resolve with the matching books
        } else {
          reject('No books found by this author') // Reject if no matching books found
        }
      })
    }

    const author = req.params.author
    const booksByAuthor = await findBooksByAuthor(author)
    res.send(booksByAuthor) // Send the list of matching books if resolved
  } catch (error) {
    res.status(404).send({ message: error }) // Send error message if rejected
  }
})

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
  try {
    const findBooksByTitle = async (title) => {
      return new Promise((resolve, reject) => {
        const matchingBooks = Object.values(books).filter((book) => book.title.toLowerCase() === title.toLowerCase())

        if (matchingBooks.length > 0) {
          resolve(matchingBooks) // Resolve with the matching books
        } else {
          reject('No books found based on this title') // Reject if no books found
        }
      })
    }

    const title = req.params.title
    const booksByTitle = await findBooksByTitle(title)
    res.send(booksByTitle) // Send the list of matching books if resolved
  } catch (error) {
    res.status(404).send({ message: error }) // Send error message if rejected
  }
})

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn
  const matchingBooks = Object.values(books).filter((book) => book.isbn === isbn)

  if (matchingBooks.length > 0) {
    res.send(matchingBooks.map((book) => book.reviews))
  } else {
    res.status(404).send({ message: 'No books found based on this title' })
  }
})

module.exports.general = public_users
