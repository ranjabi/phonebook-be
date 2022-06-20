const mongoose = require('mongoose');

const password = process.argv[2];
const url = `mongodb+srv://admin:${password}@cluster0.djc3aqt.mongodb.net/phonebook?retryWrites=true&w=majority`;

if (process.argv.length < 3) {
  console.log(
    'Please provide the password as an argument: node mongo.js <password>'
  );
  process.exit(1);
} else if (process.argv.length === 3) {
  mongoose
    .connect(url)
    .then(() => {
      Phonebook.find({}).then((result) => {
        console.log('phonebook');
        result.forEach((data) => {
          console.log(data.name, data.number);
        });
        mongoose.connection.close();
      });
    })
    .catch((err) => console.log(err));
} else {
  const nameArg = process.argv[3];
  const numberArg = process.argv[4];

  mongoose
    .connect(url)
    .then((result) => {
      console.log('connected');

      const phonebook = new Phonebook({
        name: nameArg,
        number: numberArg,
      });

      return phonebook.save();
    })
    .then(() => {
      console.log(`added ${nameArg} number ${numberArg} to phonebook`);
      return mongoose.connection.close();
    })
    .catch((err) => console.log(err));
}
