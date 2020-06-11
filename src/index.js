/* Starts the Wikisei server. */

const bodyparser = require('body-parser')
const app = require('express')()

app.use(bodyparser.json())
/*
const fallback = require('express-history-api-fallback')

app.use(fallback(fallback('index.html', { root: __dirname + '/frontend' })))
*/

// Route requests for pages
const pageRouter = require('./controllers/page.js')
app.use('/api/page/', pageRouter)

// Error handling - to skip delivering a whole html page
app.use((err, _req, res) => res.sendStatus(err))

// Get the port from environment variables - otherwise, use :1337
const port = process.env.PORT || 1337

// Start the server
app.listen(port, () => console.log(`Wikisei running on ${port}`))
