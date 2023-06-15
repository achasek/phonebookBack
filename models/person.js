const mongoose = require('mongoose');
mongoose.set('strictQuery',false)

const URL = process.env.DATABASE_URL
console.log('connecting to', URL)

mongoose.connect(URL)
    .then(result => {
        console.log('Connected to MongoDB Successfully')
    })
    .catch(error => {
        console.log(`Connection to MongoDB failed: ${error}`)
    })

const personSchema = new mongoose.Schema({
    id: String,
    name: String,
    number: Number,
})
    
personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
    }
})

// this line is needed to make the above schema work
// it exports this module allowing it to be used by external modules
module.exports = mongoose.model('Person', personSchema)