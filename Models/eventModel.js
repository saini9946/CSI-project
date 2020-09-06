const mongoose = require('mongoose');
const slugify = require('slugify');
//const validator = require('validator');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'An event must have a name'],
    unique: true,
    trim: true,
    maxlength: [30, 'AN event name cant have more than 30 characters'],
    minlength: [3, 'An event name must have atleast 3 characters']
    //validate: [validator.isAlpha, 'A discription can have only letters in it'],
  },
  slug: String,
  duration: {
    type: String,
    required: [true, 'An event must have a duration']
  },
  team: {
    type: String,
    required: [true, 'An event must have a team']
  },
  price: {
    type: String,
    required: [true, 'An event must have a price']
  },
  StartDates: {
    type: String,
    required: [true, 'An event must have a start date']
  },
  description: {
    required: [true, 'An event must have a description'],
    type: String
  },
  ResultDate: {
    type: String
  },
  Timing: {
    type: String
  },
  imageCover: {
    type: String
  },
  images: {
    type: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  }
});
eventSchema.index({ slug: 1 });
eventSchema.pre('save', function() {
  this.slug = slugify(this.name, { lower: true });
  // eslint-disable-next-line no-undef
  next();
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
