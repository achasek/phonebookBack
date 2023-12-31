const logger = require('./logger')
const morgan = require('morgan')

// name of custom morgan token is 1st parameter 'body'
morgan.token('body', function getBody (req) {
  // we have to stringify here or else this morgan custom body token
  // that we create here will log as undefined
  return JSON.stringify(req.body)
})

const requestLogger = (req, res, next) => {
  logger.info('Method:', req.method)
  logger.info('Path:  ', req.path)
  logger.info('Body:  ', req.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  // if error is CastError, that means error was related to mongoDB id
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
    // else-if block added to handled errors related to data not passing
    // a Mongoose validator
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

module.exports = {
  morgan,
  requestLogger,
  unknownEndpoint,
  errorHandler
}