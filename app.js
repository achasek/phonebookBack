// app.js is where the application is actually created
// where we create all of our routers and start the middleware pipeline

const express = require('express')
const app = express()

const cors = require('cors')

// UNFINISHED this shouldnt be required since its used in config.js
// but app crashes without it here as well
require('dotenv').config()

const morgan = require('morgan')

// name of custom morgan token is 1st parameter 'body'
morgan.token('body', function getBody (req) {
  // we have to stringify here or else this morgan custom body token
  // that we create here will log as undefined
  return JSON.stringify(req.body)
})

const personsRouter = require('./controllers/persons')
// if we wanted to add another router meant for dealing with other features
// outside of our current phonebook features, we could start adding it here
// by requiring it from where it would be declared, the controllers
// const newRouter = require('./controllers/newCtrl')
const infoRouter = require('./controllers/info')

const config = require('./utilities/config')
const middleware = require('./utilities/middleware')
const logger = require('./utilities/logger')

const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

logger.info('connecting to', config.DATABASE_URL)

mongoose.connect(config.DATABASE_URL)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message)
  })

// mount middleware here
app.use(cors())
// built in middelware to allow express to render static html pages and JS
// this allows us to view production build in browser like during part3 deployment
app.use(express.static('build'))
// express json body parser should always be one of the first middlewares mounted
app.use(express.json())
// since requestLogger requires the req.body to be populated, we must use json parser first to populate req.body
app.use(middleware.requestLogger)
// we then call upon the custom morgan token 'body' at the end of this string
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// before our big file restructure, we only used one main Express router
// now, we are using separte routers for each of our applications functions
// this defines a mini-router of sorts exclusively meant to handle HTTP requests
// with the URL of '/api/persons'
app.use('/api/persons', personsRouter)

// of course, if we wanted to add more features to our app, we could add another router
// here, for ex. if we wanted to added another series of HTTP requests for
// another feature
// we could add another instance of the parent Express router specifically for our new features
// app.use('/api/newFeature', newRouter)
app.use('/info', infoRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app