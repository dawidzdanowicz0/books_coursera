const express = require('express')
const jwt = require('jsonwebtoken')
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated
const genl_routes = require('./router/general.js').general

const app = express()

app.use(express.json())

app.use('/customer', session({ secret: 'fingerprint_customer', resave: true, saveUninitialized: true }))

app.use('/customer/auth/*', function auth(req, res, next) {
  // Check if the session exists
  if (req.session && req.session.authorization) {
    // Optionally verify the JWT stored in session
    let token = req.session.authorization['accessToken']
    jwt.verify(token, 'access', (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid Token' })
      }
      req.user = user // Attach user data to the request
      next()
    })
  } else {
    return res.status(401).json({ message: 'Unauthorized access' })
  }
})

const PORT = 8000

app.use('/customer', customer_routes)
app.use('/', genl_routes)

app.listen(PORT, () => console.log('Server is running'))
