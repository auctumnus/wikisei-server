'use strict'
/* Starts the Wikisei server. */

const bodyparser = require('body-parser')
const app = require('express')()
const packagejson = require('../package.json')

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended: true}))
/*
const fallback = require('express-history-api-fallback')

app.use(fallback(fallback('index.html', { root: __dirname + '/frontend' })))
*/
app.use((_req, res, next) => {
  res.append('Accept-version', packagejson.version)
  next()
})

// Route requests for pages
const pageRouter = require('./controllers/page.js')
app.use('/api/page/', pageRouter)

// Get the port from environment variables - otherwise, use :1337
const port = process.env.PORT || 1337

// Start the server
app.listen(port, () => console.log(`Wikisei running on ${port}`))
