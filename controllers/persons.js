const personsRouter = require('express').Router()
const Person = require('../models/person')

// if we wanted to add another router meant for dealing with other features
// outside of our current phonebook features, we would declare it like this
// but in a separate file
// const newRouter = require('express').Router()
// const NewModel = require('../models/NewModel')


// notice that URI is shorter now. The base URL for THIS PARTICULAR ROUTER is
// is defined in app.js like so - app.use('/api/persons', personsRouter)
personsRouter.get('/', (req, res) => {
  Person.find({}).then(persons => {
    console.log('get all route hit')
    res.json(persons)
  })
})

personsRouter.get('/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if(person) {
        res.json(person)
        // this else is for when id cannot be found
      } else {
        res.status(404).send({ error: `person with id of ${req.params.id} could not be found` })
      }
    })
  // this catch is for when the promise rejects; different from the else block prior
  // next(error) points to errorHandler() custom middleware above
    .catch(error => {
      next(error)
    })
})


personsRouter.post('/', (req, res, next) => {
  const body = req.body

  // this if-block is only needed when we aren't using Mongoose validators
  // if(!body.name || !body.number) {
  //     return res.status(404).send({ error: 'Entry must contain a name and number'})
  // }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save()
    .then(newPerson => {
      res.json(newPerson)
      console.log(newPerson)
    })
    .catch(error => {
      next(error)
    })
})

personsRouter.put('/:id', (req, res, next) => {
  // destructed name and number act as required configuration object for runValidators to work
  const { name, number } = req.body

  // code prior to Mongoose validator functions
  // const body = req.body

  // const person = {
  //     name: body.name,
  //     number: body.number
  // }

  Person.findByIdAndUpdate(req.params.id, { name, number }, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(error => {
      next(error)
    })
})

personsRouter.delete('/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
  // eslint-disable-next-line no-unused-vars
    .then(result => {
      res.status(204).end()
    })
    .catch(error => {
      next(error)
    })
})

module.exports = personsRouter