/* Creates the Wikisei database. */

const sqlite = require('better-sqlite3')
const fs = require('fs')
const path = require('path')

const db = new sqlite('./db/wikisei.db')

fs.readFile(path.join(__dirname, 'db', 'install.sql'), 'utf8', (err, file) => {
  if (err) {
    console.error('Received an error trying to read the install.sql file:', err)
  } else {
    try {
      db.exec(file)
    } catch(dbErr) {
      console.error('Failed to create the database:')
      console.error(dbErr)
      return undefined
    }
    console.log(`Successfully created the database at ${path.join('db', 'wikisei.db')}.`)
  }
})