const infoRouter = require('express').Router()

infoRouter.get('/', (req, res) => {
  // eslint-disable-next-line no-undef
  res.send(`<h1>Phonebook has info for x amount of people</h1>
      <br/>
      <h1>${new Date()}</h1>`)
})

module.exports = infoRouter