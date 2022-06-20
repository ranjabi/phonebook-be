require('dotenv').config()
const express = require('express');
const app = express();
const cors = require('cors');
const Phonebook = require('./models/phonebook')
var morgan = require('morgan');

app.use(express.static('build'));
app.use(cors());
app.use(express.json());

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
    ].join(' ');
  })
);

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
];

const isExists = (name, persons) => {
  for (let person of persons) {
    if (name === person.name) {
      return true;
    }
  }
  return false;
};

// get from mongoDB
app.get('/api/persons', (request, response) => {
  Phonebook.find({}).then(data => {
    response.json(data)
  })
});

app.get('/info', (request, response) => {
  response.send(
    `<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`
  );
});

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  // const person = persons.find((person) => person.id === id);
  Phonebook.findById(request.params.id).then(person => {
    response.json(person).catch(err => console.log(err.message))
  })

  // if (person) {
  //   response.json(person);
  // } else {
  //   response.status(404).end();
  // }
});

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

const generateId = () => {
  const maxId = persons.length > 0 ? Math.max(...persons.map((n) => n.id)) : 0;
  return maxId + 1;
};

app.post('/api/persons', (request, response) => {
  const body = request.body;
  // console.log(body);

  // bisa juga pake undefined
  // if (body.content === undefined) {
  //   return response.status(400).json({ error: 'content missing' })
  // }

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number is missing',
    });
  }

  // if (isExists(body.name, persons)) {
  //   return response.status(400).json({
  //     error: 'name already exists',
  //   });
  // }
  console.log('nyampe')
  const person = new Phonebook({
    name: body.name,
    number: body.number,
  });

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
});

const PORT = process.env.PORT || 3001;
app.listen(PORT);
console.log(`Server running on port ${PORT}`);
