require('dotenv').config()

const mongoose = require('mongoose')
const url = process.env.MONGODB_URI

mongoose
  .connect(url)
  .then((res) => {
    console.log('connected to mongoDB')
  })
  .catch((err) => {
    console.log('error connecting to mongoDB', err.message)
  })

const phonebookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  number: {
    type: Number,
    required: true,
  },
})

phonebookSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Phonebook', phonebookSchema) // constructor
