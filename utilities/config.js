// the config file is used to separate the handling of all ENV variables

// this is needed for outside modules to be able to read contents of ENV
require('dotenv').config()

const DATABASE_URL = process.env.DATABASE_URL
const PASSWORD = process.env.PASSWORD
const PORT = process.env.PORT

module.exports = {
  DATABASE_URL,
  PASSWORD,
  PORT
}