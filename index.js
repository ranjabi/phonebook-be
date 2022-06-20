require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const Phonebook = require('./models/phonebook')
var morgan = require('morgan')

app.use(cors())
app.use(express.static('build'))
app.use(express.json())

app.use(
  morgan((tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
      JSON.stringify(req.body),
    ].join(' ')
  })
)

let persons = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
]

// get from mongoDB
app.get('/api/persons', (request, response) => {
  Phonebook.find({}).then((data) => {
    response.json(data)
  })
})

app.get('/info', (request, response) => {
  response.send(
    `<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`
  )
})

app.get('/api/persons/:id', (request, response, next) => {
  // const person = persons.find((person) => person.id === id);
  Phonebook.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(400).end()
      }
    })
    .catch((error) => next(error))

  // if (person) {
  //   response.json(person);
  // } else {
  //   response.status(404).end();
  // }
})

app.delete('/api/persons/:id', (request, response, next) => {
  Phonebook.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end()
    })
    .catch((err) => next(err))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  // console.log(body);

  // bisa juga pake undefined
  // if (body.content === undefined) {
  //   return response.status(400).json({ error: 'content missing' })
  // }

  const person = new Phonebook({
    name: body.name,
    number: body.number,
  })

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson)
    })
    .catch((err) => next(err))
  // database constraint is handled by mongoDB validations
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// handler of requests with result to errors
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)
