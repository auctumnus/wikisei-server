/* Handles rendering articles. */

const sanitizeHTML = require('sanitize-html')
const marked = require('marked')
const plugin = require('../plugin')
const config = require('../../wikisei.config')

const any = require('p-any')

const sanitizeOptions = {
  allowedTags: [],
  allowedAttributes: {},
  disallowedTagsMode: 'discard'
}

const wait = time => new Promise(_ => setTimeout(_, time))

const sanitize = dirty => sanitizeHTML(dirty, sanitizeOptions)

const renderArticle = text => plugin.renderText(marked(sanitize(text)))

const tryRender = text => {
  let err
  const result = any([
    renderArticle(text),
    wait(config.maxRenderTime).then(() => err = 'Article took too long to render')
  ])
  if(err) {
    return { err }
  } else {
    return result
  }
}

module.exports = {
  tryRender
}