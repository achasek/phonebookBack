// to run the test, run this in the CLI with the actual password
// node mongo.js <password>
// go to MongoDB Atlas and browse collections under the current project

const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

// .argv is an array of CLI args separated by space, the el with idx[2]
// is the password in the above mentioned CLI to run this test module
const password = process.argv[2]

const url =
  `mongodb+srv://chaseknieper:${password}@cluster0.j3qrbrx.mongodb.net/persons?retryWrites=true&w=majority`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  id: Number,
  name: String,
  number: Number,
})

const Person = mongoose.model('Person', personSchema)

// static test of database
// const person = new Person({
//   id: 5,
//   name: 'chuz',
//   number: 9895761375,
// })

// person.save().then(result => {
//   console.log(`person saved! ${person.name} to phonebook`)
//   mongoose.connection.close()
// })

// dynamic testing allows for the addition of new entires via the CLI like 
// node mongoTest.js <password> 6 'kyra w' 456
const length = process.argv.length
if(length > 3) {
    const person = new Person({
        // id: process.argv[3],
        name: process.argv[3],
        number: process.argv[4]
    })

    person.save().then(result => {
        console.log(`${person.name} added`)
        mongoose.connection.close()
    })
} else {
    // result is an array of all documents here
    Person.find({}).then(result => {
        result.forEach(note => {
        console.log(note)
        })
        mongoose.connection.close()
    })
}