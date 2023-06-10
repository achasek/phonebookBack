const express = require('express');
const app = express();
const morgan = require('morgan'); 
const cors = require('cors');
app.use(cors());

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

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

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

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    console.log(req.params, 'params')
    console.log(id, 'id')
    const person = persons.find(person => person.id === id)
    if(person) {
        res.json(person)
    } else {
        res.status(404).send(`Could not find person with id of ${id}`)
    }
})

app.post('/api/persons', (req, res) => {
    const person = req.body
    const id = Math.floor(Math.random() * 1000)
    person.id = id
    const names = persons.map(person => person.name)
    if(person.name && person.number) {
        if(names.includes(person.name)) {
            res.status(404).send(`${person.name} already exists`)
        } else {
            console.log(person)
            console.log(req.body)
            // persons = persons.concat(person)
            res.json(person)
        }
    } else {
        res.status(404).send('<h1>Entry must contain a name and number</h1>')
    }
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)

    res.status(204).end()
})

// use at end of middleware pipeline and after all HTTP requests since unknown endpoint would be a final catch error
app.use(unknownEndpoint)

// old: const PORT = 3001 - this change is for deployment
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})