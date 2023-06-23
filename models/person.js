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

const phoneNumberValidator = (numStr) => {
    return /\d{3}-\d{3}-\d{4}/.test(numStr);
}

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 2,
        // you can put the error message here
        // required: [true, 'Name Required'],
        // or simply omit it and leave the error message to the errorHandler middleware
        required: true
    },
    number: {
       type: String,
       validate: {
        validator: phoneNumberValidator,
        message: props => `${props.value} is not a valid phone number - must be in format xxx-xxx-xxxx`
       },
       required: [true, 'Phone Number Required']
    }
})
    
// here i am starting the number key as type string and parsing it
// to a number so it can be validated for a length propety by Mongoose
// once it passes the validator function, which length is a propety of strings only
// it then will be parsed to a number, keeping the data-types correct AND
// passing validator functions
personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        // returnedObject.number = Number(returnedObject.number)
    }
})

// this line is needed to make the above schema work
// it exports this module allowing it to be used by external modules
module.exports = mongoose.model('Person', personSchema)