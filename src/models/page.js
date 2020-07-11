/* Defines the model for pages. */

const sqlite = require('better-sqlite3')
const joi = require('@hapi/joi')

const db = new sqlite('db/wikisei.db')

module.exports = {
  // Simply checks if a page exists, rather than having to juggle a possibly
  // large page just to see if we get anything back
  exists (name) {
    let result
    try {
      result = db.prepare('SELECT EXISTS (SELECT 1 FROM pages WHERE slug = $name) AS "exists"').get({name})
    } catch(err) {
      return {err}
    }
    return {result: !!result.exists}
  },
  get (name) {
    let result
    try {
      result = db.prepare('SELECT * FROM pages WHERE slug = $name').get({name})
    } catch (err) {
      return {err}
    }
    return {result}
  },
  list (offset) {
    let result
    try {
      result = db.prepare('SELECT * FROM pages LIMIT 10 OFFSET $offset').get({offset})
    } catch (err) {
      return {err}
    }
    return {result}
  },
  // Doesn't perform any checking, do that in the controller
  new (slug, name, markdown, html, created, updated, tags) {
    try {
      db.prepare('INSERT INTO pages (slug, name, markdown, html, created, updated, tags) VALUES ($slug, $name, $markdown, $html, $created, $updated, $tags)').run({slug, name, markdown, html, created, updated, tags})
    } catch (err) {
      return {err}
    }
    return {slug}
  },
  /* The tags part of the object has to go through extra handling - namely */
  /* it must be a string of tags separated by commas, e.g. "a,b,c" is      */
  /* a tags string for the tags "a", "b", and "c".                         */
  schema: joi.object({
    name: joi.string()
             .pattern(/[a-z0-9-._~]/)
             .max(20)
             .required(),
    markdown: joi.string()
                 .required(),
    tags: joi.string()
  })
}