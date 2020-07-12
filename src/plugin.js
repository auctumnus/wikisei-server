'use strict'
/* Handles plugin calls. */
const fs = require('fs').promises
const path = require('path')

/* EJS */
const ejs = require('ejs')
const ejsOptions = {
  root: path.resolve('/plugins/')
}

// Setup the cache
const lru = require('lru-cache')
const cacheOptions = {
  max: 100,
  length (n, _key) { return n.length } // eslint-disable-line
}

const cache = new lru(cacheOptions)

/**
 * Trims the whitespace off each string in an array.
 * If a value is not a string, returns the value unmodified.
 * @param {Array} arr The array to trim the whitespace of the strings of.
 * @returns {Array} The array with the whitespace trimmed.
 */
const trimArr = arr => arr.map(v => (typeof v === 'string') ? v.trim() : v)


/**
 * Takes a plugin call string and retrieves the plugin name and parameters.
 * @param {String} s The plugin call string.
 * @returns {Object} Data for the plugin call. Has two values: pluginName and params. pluginName is a string with the name of the plugin, and params is an object with keys and values corresponding to the given parameters.
 */
const parsePluginCall = s => {
  if(s.startsWith('{{') && s.endsWith('}}')) {
    s = s.slice(2, s.length - 2)
  }
  const parts = trimArr(s.split('|'))
  const pluginName = parts.shift(1)
  let params = {}
  if(parts.length > 0) {
    params = Object.fromEntries(
      parts.map(p => trimArr(p.split('=')))
    )
  }
  return {pluginName, params}
}

/**
 * Retrieves a plugin's template, first checking the cache and retrieving the cached version, or reading the file from disk if the plugin hasn't been cached, and stores the file in the cache.
 * @param {String} name The name of the plugin to get the template for.
 * @returns {Object} The results. The object has two values: err if there was an error in reading the file, and data, which holds the template as a string.
 */
const getPluginFile = async (name) => {
  if(cache.has(name)) {
    return { data: cache.get(name)}
  } else {
    let data
    try {
      data = await fs.readFile(`plugins/${name}.ejs`, 'utf8')
    } catch(err) {
      if(err.code === 'ENOENT') return { err: `no such plugin "${name}"`}
      if(err.code === 'EACCESS') return { err: `server does not have permissions to access plugin "${name}"`}
      return { err: `error in calling plugin "${name}"`}
    }
    return { data }
  }
}

/**
 * Renders a plugin template by name, with given parameters.
 * @param {String} name The name of the plugin to render.
 * @param {Object} params The parameters to pass to the plugin.
 * @returns {Object} The results. The object has two values: err if there was an error in reading the file, and data, which holds the rendered HTML.
 */
const callPlugin = async (name, params={}) => {
  if(name.match(/[./]/)) {
    return {
      err: 'plugin name cannot contain . or /'
    }
  }
  const {err, data} = await getPluginFile(name)
  if(err) return {err}
  return {data: ejs.render(data, params, ejsOptions)}
}

const renderText = async (text) => {
  let errors = []
  while(true) {
    const match = text.match(/\{\{.+\}\}/)
    if(!match) break
    const { pluginName, params } = parsePluginCall(match[0])
    const rendered = await callPlugin(pluginName, params)
    if(rendered.err) {
      errors.append(rendered.err)
    } else {
      text = text.replace(match[0], rendered.data)
    }
  }
  return { text, errors }
}

module.exports = {
  cache,
  trimArr,
  getPluginFile,
  parsePluginCall,
  callPlugin,
  renderText
}
