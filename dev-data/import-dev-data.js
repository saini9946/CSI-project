const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('../Models/eventModel');
const User = require('../Models/userModels');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  // eslint-disable-next-line no-console
  .then(() => console.log('DB connection successful!'));

// READ JSON FILE
const events = JSON.parse(
  fs.readFileSync(`${__dirname}/events-upcoming.json`, 'utf-8')
);
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/users-simple.json`, 'utf-8')
);

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Event.create(events);
    await User.create(users, { validateBeforeSave: false });

    // eslint-disable-next-line no-console
    console.log('Data successfully loaded!');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Event.deleteMany();
    await User.deleteMany();

    // eslint-disable-next-line no-console
    console.log('Data successfully deleted!');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
