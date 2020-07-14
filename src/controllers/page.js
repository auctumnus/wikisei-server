'use strict'
/* Defines the controller for pages. */

const slugify = require('slugify')
const marked = require('marked')
const sanitizeHTML = require('sanitize-html')
const express = require('express')
const router = express.Router()
const page = require('../models/page')
const plugin = require('../plugin')
const render = require('../render')

const sanitizeOptions = {
  allowedTags: [],
  allowedAttributes: {},
  disallowedTagsMode: 'discard'
}

const sanitize = dirty => sanitizeHTML(dirty, sanitizeOptions)

const cleanTagString = tags => {
  return tags.split(',')                // Make it into an array
             .map(val => val.trim())    // Trim spaces
             .filter(val => val !== '') // Get rid of empty tags
             .join(',')                 // Make it back into a string
             || null                    // If it's an empty array, just 
                                        // send back null
}

router.param('page_name', (req, res, next) => {
  // Get the page from the passed name
  const {result, err} = page.get(req.params.page_name)
  // If there's been an error, send 500
  if(err) {
    res.sendStatus(500)
    // If we have a result, continue along the router chain
  } else if (result) {
    req.result = result
    next()
    // Otherwise, there's no result and no error, so the page doesn't exist
  } else {
    res.sendStatus(404)
  }
})

router.route('/:page_name')
  // Send the result we got out of the database
  .get((req, res) => res.send(req.result))
  // You can't POST to a resource that already exists, that's not RESTful
  .post((_req, res) => res.sendStatus(405))
  // Unimplemented
  .put((_req, res) => res.sendStatus(501))
  .patch((_req, res) => res.sendStatus(501))
  .delete((_req, res) => res.sendStatus(501))

router.route('/')
  // List
  .get((req, res) => {
    let offset = 0
    if(req.query.offset) {
      offset = req.query.offset
    }
    const {err, result} = page.list(offset)
    if (err) {
      console.error(err)
      res.sendStatus(500)
    } else if (result) {
      console.log(result)
      res.send(result)
    } else {
      res.sendStatus(204)
    }
  })
  // New
  .post(async (req, res) => {
    // First, slugify any name that might be passed, so that it'll pass
    // schema validation
    let displayName
    if (req.body.name) {
      displayName = req.body.name
      req.body.name = slugify(req.body.name.trim(), {lower: true}).slice(0, 20)
    }

    // Validate schema
    const { error, value } = page.schema.validate(req.body)
    // If there's an error in the validation, assume it's on the part of
    // the user, and send a 400 code along with a description of the error
    if (error) {
      res.status(400)
      res.send({
        error: true,
        path: error.path,
        message: error.message,
        type: error.type,
        annotation: error.annotate(true)
      })
    } else {
      // Check if a page already exists under this name
      const existsResult = page.exists(value.name)
      // If there's a result, the page already exists; send 409 Conflict
      if (existsResult.result) {
        res.sendStatus(409)
        return undefined
      // Otherwise, it's a problem on the part of the database; send 500
      } else if (existsResult.err) {
        res.sendStatus(500)
        console.error(existsResult.err)
        return undefined
      }
      // Clean up the tags if necessary
      if (value.tags) {
        value.tags = cleanTagString(value.tags)
      }
      
      // Render article
      const rendered = await render.tryRender(value.markdown)

      // Send the page to the database
      let creationResult
      if(!rendered.err) {
        const creationResult = page.new(
          value.name,
          sanitize(displayName),
          value.markdown,
          rendered.text,
          Date.now(),
          Date.now(),
          sanitize(value.tags)
          )
      }

      // If there's an error in the process, send 500
      if (creationResult && creationResult.err) {
        res.sendStatus(500)
        console.error(creationResult.err)
      // Otherwise, send 201 Created with the name of the created page
      } else {
        res.status(201)
        if(rendered.pluginErrors) {
          res.send({
            uri: creationResult.slug,
            pluginErr: rendered.pluginErrors
          })
        } else if(rendered.err) {
          res.send({
            err: rendered.err
          })
        } else {
          res.send({
            uri: creationResult.slug
          })
        }
      }
    }
  })
  // Unimplemented
  .put((_req, res) => res.sendStatus(501))
  .patch((_req, res) => res.sendStatus(501))
  .delete((_req, res) => res.sendStatus(501))

module.exports = router