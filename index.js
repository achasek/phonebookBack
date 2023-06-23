const express = require('express');
const app = express();

// this is needed for outside modules to be able to read contents of ENV
require('dotenv').config();
const morgan = require('morgan'); 
const cors = require('cors');
app.use(cors());

// built in middelware to allow express to render static html pages and JS
// aka this allows us to view production build in browser like during part3 deployment
app.use(express.static('build'));
const Person = require('./models/person');


const requestLogger = (req, res, next) => {
    console.log('Method:', req.method)
    console.log('Path:  ', req.path)
    console.log('Body:  ', req.body)
    console.log('---')
    next()
}

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    // if error is CastError, that means error was related to mongoDB id
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } 
  
    next(error)
}

// express json body parser should always be one of the first middlewares mounted
app.use(express.json())

// name of custom morgan token is 1st parameter 'body'
morgan.token('body', function getBody (req) {
    // we have to stringify here or else this morgan custom body token
    // that we create here will log as undefined
    return JSON.stringify(req.body)
})  

// since request logger requires the req.body to be populated, we must use json parser first to populate req.body
app.use(requestLogger)

// we then call upon the custom morgan token 'body' at the end of this string
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// hard coded data before database integration
// let persons = [
//     { 
//       "id": 1,
//       "name": "Arto Hellas", 
//       "number": "040-123456"
//     },
//     { 
//       "id": 2,
//       "name": "Ada Lovelace", 
//       "number": "39-44-5323523"
//     },
//     { 
//       "id": 3,
//       "name": "Dan Abramov", 
//       "number": "12-43-234345"
//     },
//     { 
//       "id": 4,
//       "name": "Mary Poppendieck", 
//       "number": "39-23-6423122"
//     }
// ]

app.get('/', (req, res) => {
    res.send('<h1>Hello Server</h1>')
})

// to display the time that the req to the /info path is made 
// by the user client-side, you need to invoke the Date function in line and not 
// in a separate variable like I first attempted
app.get('/info', (req, res) => {
    res.send(`<h1>Phonebook has info for ${persons.length} people</h1>
    <br/>
    <h1>${new Date()}</h1>`)
})

// code prior to mongo/mongoose just responed with json via hardcoded
// persons object above
// app.get('/api/persons', (req, res) => {
//     res.json(persons)
// })

// code using mongo and mongoose now requires you to query for the data,
// then respond with that in json
app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        console.log('get all route hit')
        res.json(persons)
    })
})

// show function prior to mongo
// app.get('/api/persons/:id', (req, res) => {
//     const id = Number(req.params.id)
//     console.log(req.params, 'params')
//     console.log(id, 'id')
//     const person = persons.find(person => person.id === id)
//     if(person) {
//         res.json(person)
//     } else {
//         res.status(404).send(`Could not find person with id of ${id}`)
//     }
// })

// show function after mongodb
app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
    .then(person => {
        if(person) {
            res.json(person)
        // this else is for when id cannot be found
        } else {
            res.status(404).send({ error: `person with id of ${req.params.id} could not be found`})
        }
    })
    // this catch is for when the promise rejects; different from the else block prior
    // next(error) points to errorHandler() custom middleware above
    .catch(error => {
        next(error)
    })
})

// person creation code prior to mongodb integration and making custom id
// app.post('/api/persons', (req, res) => {
//     const person = req.body
//     const id = Math.floor(Math.random() * 1000)
//     person.id = id
//     const names = persons.map(person => person.name)
//     if(person.name && person.number) {
//         if(names.includes(person.name)) {
//             res.status(404).send(`${person.name} already exists`)
//         } else {
//             console.log(person)
//             console.log(req.body)
//             // persons = persons.concat(person)
//             res.json(person)
//         }
//     } else {
//         res.status(404).send('<h1>Entry must contain a name and number</h1>')
//     }
// })

// const everyone = Person.find({})
// person creation code with mongodb and their unique _id
app.post('/api/persons', (req, res) => {
    const body = req.body
    // const names = Person.find({})
    //     .then(persons => {
    //         persons.map(person => person.name)
    //     })
    // const names = everyone.map(person => person.names.name)
    
    // console.log(names, 'names')

    if(!body.name || !body.number) {
        return res.status(404).send({ error: 'Entry must contain a name and number'})
    }

    // if(names.includes(body.name)) {
    //     res.status(404).send(`${body.name} already exists`)
    // }

    const person = new Person({
        // id: body._id.toString(),
        name: body.name,
        number: body.number
    })

    person.save().then(newPerson => {
        res.json(newPerson)
        console.log(newPerson)
    })
})

// separate put request with mongoDB 
app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(req.params.id, person, {new: true})
    .then(updatedPerson => {
        res.json(updatedPerson)
    })
    .catch(error => {
        next(error)
    })
})

// code prior to mongoDB
// app.delete('/api/persons/:id', (req, res) => {
//     const id = Number(req.params.id)
//     persons = persons.filter(person => person.id !== id)

//     res.status(204).end()
// })

// code with mongoDB
app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
    .then(result => {
        res.status(204).end()
    })
    .catch(error => {
        next(error)
    })
})

// use at almost end of middleware pipeline and after all HTTP requests since unknown endpoint would be a final catch error
app.use(unknownEndpoint)

// use at very end since it is our furthest URI from our base
// unknown endpoint handles unknown keywords in URI prior to the req.params
// once req.params are introduced in our URI, this middleware takes over
// making it the very last one to execute
app.use(errorHandler)

// old: const PORT = 3001 - this change is for deployment
// it just says to check env file for PORT, and if no such variable
// exists in env, to then use port 3001
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})