// the logger file is used to extract the console.logging of information
// and errors to one file. This helps to keep your other code less cluttered
// with a lot of console.log lines

// we call upon this logger by first requiring it via
// const logger = require('./logger')
// and then calling logger.info('some message') or
// logger.error('some error') depending on what you want to log

const info = (...params) => {
  console.log(...params)
}

const error = (...params) => {
  console.error(...params)
}

module.exports = {
  info, error
}